use anyhow::{Context, Result, bail};
use builder_core::{ArtifactPayload, create_artifact_payload_with_output, optimize_assets};
use std::io::{BufRead, BufReader, Read};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;

use crate::api::ApiClient;
use crate::framework::{detect_framework, detect_install_command, resolve_output_dir};
use crate::framework_output::resolve_build_output;

pub(crate) fn deploy(prod: bool) -> Result<()> {
    let token = deployment_token()?;
    let cwd = std::env::current_dir()?;
    let (_root, link) = cli_config::find_link(&cwd)?.ok_or_else(|| {
        anyhow::anyhow!("No linked project — run `multivrs link --project <id>`.")
    })?;
    let target = if prod { "production" } else { "preview" };
    println!("Deploying project {} ({target})…", link.project_id);
    let framework = match non_empty_env("MULTIVRS_FRAMEWORK") {
        Some(id) => crate::framework::Framework::from_id(&id)?,
        None => detect_framework(&cwd)?,
    };
    println!("  • detected {}", framework.name());
    let api = ApiClient::new(token);
    let deployment = match non_empty_env("MULTIVRS_DEPLOYMENT_ID") {
        Some(id) => crate::api::Deployment { id, url: None },
        None => api.create_deployment(&link.project_id, target)?,
    };
    println!("  • building deployment {}", deployment.id);
    api.update_status(&link.project_id, &deployment.id, "building", None)?;
    api.append_log(
        &link.project_id,
        &deployment.id,
        "info",
        &format!("Detected {}", framework.name()),
    )?;
    let build = (|| -> Result<ArtifactPayload> {
        let install_command =
            non_empty_env("MULTIVRS_INSTALL_COMMAND").or_else(|| detect_install_command(&cwd));
        if let Some(command) = install_command {
            println!("  • running {command}");
            api.append_log(&link.project_id, &deployment.id, "info", &command)?;
            run_shell(&command, &cwd)?;
        }
        let build_command =
            non_empty_env("MULTIVRS_BUILD_COMMAND").or_else(|| framework.build_command());
        if let Some(command) = build_command {
            println!("  • running {command}");
            api.append_log(&link.project_id, &deployment.id, "info", &command)?;
            run_shell(&command, &cwd)?;
        }
        let output_dir = resolve_output_directory(framework, &cwd)?;
        let output = resolve_build_output(framework, &output_dir)?;
        let optimized = optimize_assets(&output_dir)?;
        let summary = format!(
            "Optimized {} assets ({} skipped, {} → {} bytes)",
            optimized.created, optimized.skipped, optimized.input_bytes, optimized.output_bytes
        );
        println!("  • {summary}");
        api.append_log(&link.project_id, &deployment.id, "info", &summary)?;
        for warning in optimized.warnings {
            api.append_log(&link.project_id, &deployment.id, "warning", &warning)?;
        }
        create_artifact_payload_with_output(&output_dir, target, output)
    })();
    let artifact = match build {
        Ok(artifact) => artifact,
        Err(error) => {
            record_failure(&api, &link.project_id, &deployment.id, &error);
            return Err(error);
        }
    };
    println!("  • created artifact {}", artifact.artifact_hash);
    api.append_log(
        &link.project_id,
        &deployment.id,
        "info",
        &format!("Created artifact {}", artifact.artifact_hash),
    )?;
    let ready = api.deploy_artifact(&link.project_id, &deployment.id, &artifact)?;
    println!(
        "  • ready {}",
        ready.url.unwrap_or_else(|| "(no url)".to_string())
    );
    Ok(())
}

fn non_empty_env(name: &str) -> Option<String> {
    std::env::var(name)
        .ok()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}

fn deployment_token() -> Result<String> {
    if let Some(token) = non_empty_env("MULTIVRS_TOKEN") {
        return Ok(token);
    }
    cli_auth::Store::at_home()?
        .load()?
        .map(|credentials| credentials.token)
        .ok_or_else(|| {
            anyhow::anyhow!("Not logged in — run `multivrs login --token <token>` first.")
        })
}

fn resolve_output_directory(framework: crate::framework::Framework, cwd: &Path) -> Result<PathBuf> {
    if let Some(directory) = non_empty_env("MULTIVRS_OUTPUT_DIRECTORY") {
        return Ok(cwd.join(directory));
    }
    resolve_output_dir(framework, cwd)
}

fn record_failure(api: &ApiClient, project_id: &str, deployment_id: &str, error: &anyhow::Error) {
    let message = error.to_string();
    let _ = api.append_log(project_id, deployment_id, "error", &message);
    let _ = api.update_status(project_id, deployment_id, "error", Some(&message));
}

fn run_shell(command: &str, cwd: &Path) -> Result<()> {
    let mut child = Command::new("sh")
        .arg("-lc")
        .arg(command)
        .current_dir(cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .with_context(|| format!("failed to run {command}"))?;
    let stdout = child
        .stdout
        .take()
        .context("build stdout was not captured")?;
    let stderr = child
        .stderr
        .take()
        .context("build stderr was not captured")?;
    let stdout_thread = forward_output(stdout, false);
    let stderr_thread = forward_output(stderr, true);
    let status = child.wait()?;
    let _stdout = stdout_thread
        .join()
        .map_err(|_| anyhow::anyhow!("build stdout reader stopped unexpectedly"))?;
    let stderr = stderr_thread
        .join()
        .map_err(|_| anyhow::anyhow!("build stderr reader stopped unexpectedly"))?;
    if !status.success() {
        bail!("build command failed: {command}\n{}", truncate_log(&stderr));
    }
    Ok(())
}

fn forward_output<R: Read + Send + 'static>(reader: R, stderr: bool) -> thread::JoinHandle<String> {
    thread::spawn(move || {
        let mut captured = String::new();
        for line in BufReader::new(reader).lines().map_while(Result::ok) {
            if stderr {
                eprintln!("{line}");
            } else {
                println!("{line}");
            }
            captured.push_str(&line);
            captured.push('\n');
        }
        captured
    })
}

pub(crate) fn truncate_log(message: &str) -> String {
    message.chars().take(20_000).collect()
}
