use super::OptimizationReport;
use super::images::variant_path;
use anyhow::{Context, Result, bail};
use std::fs;
use std::path::Path;
use std::process::Command;

pub(super) fn optimize_video(path: &Path) -> Result<OptimizationReport> {
    run_optional(
        "ffmpeg",
        path,
        "webm",
        &[
            "-y",
            "-i",
            "{input}",
            "-c:v",
            "libvpx-vp9",
            "-crf",
            "32",
            "-b:v",
            "0",
            "-an",
            "{output}",
        ],
    )
}

pub(super) fn optimize_font(path: &Path) -> Result<OptimizationReport> {
    run_optional(
        "pyftsubset",
        path,
        "woff2",
        &[
            "{input}",
            "--output-file={output}",
            "--flavor=woff2",
            "--unicodes=*",
            "--layout-features=*",
        ],
    )
}

fn run_optional(
    tool: &str,
    input: &Path,
    extension: &str,
    args: &[&str],
) -> Result<OptimizationReport> {
    if !tool_exists(tool) {
        return Ok(OptimizationReport::skipped(format!(
            "{} skipped: {tool} is not installed",
            input.display()
        )));
    }
    let output = variant_path(input, extension);
    if output.exists() {
        return Ok(OptimizationReport::default());
    }
    let input_value = input.to_string_lossy();
    let output_value = output.to_string_lossy();
    let resolved = args
        .iter()
        .map(|arg| {
            arg.replace("{input}", &input_value)
                .replace("{output}", &output_value)
        })
        .collect::<Vec<_>>();
    let result = Command::new(tool)
        .args(resolved)
        .output()
        .with_context(|| format!("failed to run {tool}"))?;
    if !result.status.success() {
        bail!(
            "{tool} failed for {}: {}",
            input.display(),
            String::from_utf8_lossy(&result.stderr)
        );
    }
    Ok(OptimizationReport::created(
        fs::metadata(input)?.len(),
        fs::metadata(output)?.len(),
    ))
}

fn tool_exists(tool: &str) -> bool {
    Command::new(tool)
        .arg("--version")
        .output()
        .is_ok_and(|result| result.status.success())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_tool_is_a_non_fatal_skip() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("font.ttf");
        fs::write(&input, b"font").unwrap();
        let report =
            run_optional("multivrs-tool-that-does-not-exist", &input, "woff2", &[]).unwrap();
        assert_eq!(report.skipped, 1);
        assert_eq!(report.warnings.len(), 1);
    }

    #[test]
    fn creates_webm_when_ffmpeg_is_available() {
        if !tool_exists("ffmpeg") {
            return;
        }
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("clip.mp4");
        let generated = Command::new("ffmpeg")
            .args([
                "-y",
                "-f",
                "lavfi",
                "-i",
                "color=c=black:s=32x32:d=0.1",
                "-pix_fmt",
                "yuv420p",
            ])
            .arg(&input)
            .output()
            .unwrap();
        assert!(generated.status.success());
        let report = optimize_video(&input).unwrap();
        assert_eq!(report.created, 1);
        assert!(variant_path(&input, "webm").exists());
    }
}
