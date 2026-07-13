use anyhow::{Context, Result, bail};
use builder_core::{ArtifactPayload, create_artifact_payload_with_output, optimize_assets};
use std::path::Path;
use std::process::Command;

use crate::api::ApiClient;
use crate::framework::{detect_framework, resolve_output_dir};
use crate::framework_output::resolve_build_output;

pub(crate) fn deploy(prod: bool) -> Result<()> {
    let creds = cli_auth::Store::at_home()?.load()?.ok_or_else(|| {
        anyhow::anyhow!("Not logged in — run `multivrs login --token <token>` first.")
    })?;
    let cwd = std::env::current_dir()?;
    let (_root, link) = cli_config::find_link(&cwd)?.ok_or_else(|| {
        anyhow::anyhow!("No linked project — run `multivrs link --project <id>`.")
    })?;
    let target = if prod { "production" } else { "preview" };
    println!("Deploying project {} ({target})…", link.project_id);
    let framework = detect_framework(&cwd)?;
    println!("  • detected {}", framework.name());
    let api = ApiClient::new(creds.token);
    let deployment = api.create_deployment(&link.project_id, target)?;
    println!("  • queued deployment {}", deployment.id);
    api.update_status(&link.project_id, &deployment.id, "building", None)?;
    api.append_log(
        &link.project_id,
        &deployment.id,
        "info",
        &format!("Detected {}", framework.name()),
    )?;
    let build = (|| -> Result<ArtifactPayload> {
        if let Some(command) = framework.build_command() {
            println!("  • running {command}");
            api.append_log(&link.project_id, &deployment.id, "info", command)?;
            run_shell(command, &cwd)?;
        }
        let output_dir = resolve_output_dir(framework, &cwd)?;
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

fn record_failure(api: &ApiClient, project_id: &str, deployment_id: &str, error: &anyhow::Error) {
    let message = error.to_string();
    let _ = api.append_log(project_id, deployment_id, "error", &message);
    let _ = api.update_status(project_id, deployment_id, "error", Some(&message));
}

fn run_shell(command: &str, cwd: &Path) -> Result<()> {
    let output = Command::new("sh")
        .arg("-lc")
        .arg(command)
        .current_dir(cwd)
        .output()
        .with_context(|| format!("failed to run {command}"))?;
    print!("{}", String::from_utf8_lossy(&output.stdout));
    eprint!("{}", String::from_utf8_lossy(&output.stderr));
    if !output.status.success() {
        let details = String::from_utf8_lossy(&output.stderr);
        bail!(
            "build command failed: {command}\n{}",
            truncate_log(&details)
        );
    }
    Ok(())
}

pub(crate) fn truncate_log(message: &str) -> String {
    message.chars().take(20_000).collect()
}
