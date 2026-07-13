use anyhow::{Result, bail};
use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

mod optimizer;

pub use optimizer::{OptimizationReport, optimize_assets};

#[derive(Debug, Serialize)]
pub struct ArtifactPayload {
    #[serde(rename = "artifactHash")]
    pub artifact_hash: String,
    pub target: String,
    pub output: BuildOutputPayload,
    pub files: Vec<ArtifactFilePayload>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BuildOutputPayload {
    pub framework: String,
    #[serde(rename = "staticDir")]
    pub static_dir: String,
    pub functions: Vec<serde_json::Value>,
    pub routes: Vec<BuildRoutePayload>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct BuildRoutePayload {
    pub src: String,
    pub target: serde_json::Value,
}

#[derive(Debug, Serialize)]
pub struct ArtifactFilePayload {
    pub path: String,
    pub hash: String,
    pub size: usize,
    #[serde(rename = "contentsBase64")]
    pub contents_base64: String,
}

pub fn create_artifact_payload(
    root: &Path,
    framework: &str,
    target: &str,
) -> Result<ArtifactPayload> {
    create_artifact_payload_with_output(
        root,
        target,
        BuildOutputPayload {
            framework: framework.to_string(),
            static_dir: ".".to_string(),
            functions: Vec::new(),
            routes: vec![BuildRoutePayload {
                src: "/(.*)".to_string(),
                target: serde_json::json!({ "type": "static" }),
            }],
        },
    )
}

pub fn create_artifact_payload_with_output(
    root: &Path,
    target: &str,
    output: BuildOutputPayload,
) -> Result<ArtifactPayload> {
    if !root.exists() {
        bail!("Build output does not exist: {}", root.display());
    }
    let walker = WalkDir::new(root).into_iter().filter_entry(|entry| {
        !matches!(
            entry.file_name().to_str(),
            Some(".git" | ".multivrs" | "node_modules")
        )
    });
    let mut paths = Vec::new();
    for entry in walker {
        let entry = entry?;
        if entry.file_type().is_file() {
            paths.push(entry.into_path());
        }
    }
    let mut files = paths
        .par_iter()
        .map(|path| {
            let bytes = fs::read(path)?;
            Ok(ArtifactFilePayload {
                path: path
                    .strip_prefix(root)?
                    .to_string_lossy()
                    .replace('\\', "/"),
                hash: hex::encode(Sha256::digest(&bytes)),
                size: bytes.len(),
                contents_base64: BASE64.encode(bytes),
            })
        })
        .collect::<Result<Vec<_>>>()?;
    files.sort_by(|a, b| a.path.cmp(&b.path));
    if files.is_empty() {
        bail!("Build output is empty: {}", root.display());
    }
    let mut manifest = Sha256::new();
    for file in &files {
        manifest.update(format!("{}:{}\n", file.path, file.hash));
    }
    Ok(ArtifactPayload {
        artifact_hash: hex::encode(manifest.finalize()),
        target: target.to_string(),
        output,
        files,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hashes_files_and_excludes_internal_directories() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("index.html"), "ok").unwrap();
        fs::create_dir(dir.path().join(".multivrs")).unwrap();
        fs::write(dir.path().join(".multivrs/project.json"), "{}").unwrap();
        let artifact = create_artifact_payload(dir.path(), "static", "preview").unwrap();
        assert_eq!(artifact.files.len(), 1);
        assert_eq!(artifact.files[0].path, "index.html");
        assert_eq!(artifact.artifact_hash.len(), 64);
    }
}
