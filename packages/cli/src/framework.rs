use anyhow::{Result, bail};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Framework {
    Next,
    SwiftRust,
    Vite,
    Static,
}

impl Framework {
    pub(crate) fn name(self) -> &'static str {
        match self {
            Self::Next => "Next.js",
            Self::SwiftRust => "swift-rust",
            Self::Vite => "Vite",
            Self::Static => "static",
        }
    }

    pub(crate) fn build_command(self) -> Option<&'static str> {
        match self {
            Self::Next => Some("bunx next build"),
            Self::SwiftRust => Some("swift-rust build"),
            Self::Vite => Some("bunx vite build"),
            Self::Static => None,
        }
    }

    pub(crate) fn output_dir(self) -> &'static str {
        match self {
            Self::Next => ".next",
            Self::SwiftRust | Self::Vite => "dist",
            Self::Static => ".",
        }
    }

    pub(crate) fn id(self) -> &'static str {
        match self {
            Self::Next => "nextjs",
            Self::SwiftRust => "swift-rust",
            Self::Vite => "vite",
            Self::Static => "static",
        }
    }
}

pub(crate) fn resolve_output_dir(framework: Framework, root: &Path) -> Result<PathBuf> {
    if framework == Framework::Next {
        let exported = root.join("out");
        if exported.exists() {
            return Ok(exported);
        }
        bail!(
            "This Next.js build requires compute. Use `output: \"export\"` for static serving or deploy its OpenNext Worker through the compute binding."
        );
    }
    Ok(root.join(framework.output_dir()))
}

pub(crate) fn detect_framework(root: &Path) -> Result<Framework> {
    let package_json = fs::read_to_string(root.join("package.json")).unwrap_or_default();
    if package_json.contains("\"next\"") {
        return Ok(Framework::Next);
    }
    if package_json.contains("\"swift-rust\"") || root.join("swift-rust.config.ts").exists() {
        return Ok(Framework::SwiftRust);
    }
    if package_json.contains("\"vite\"") || root.join("vite.config.ts").exists() {
        return Ok(Framework::Vite);
    }
    if root.join("index.html").exists() {
        return Ok(Framework::Static);
    }
    bail!("Could not detect a deployable framework.");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn next_requires_an_exported_output() {
        let dir = tempfile::tempdir().unwrap();
        fs::create_dir(dir.path().join(".next")).unwrap();
        assert!(resolve_output_dir(Framework::Next, dir.path()).is_err());
        fs::create_dir(dir.path().join("out")).unwrap();
        assert_eq!(
            resolve_output_dir(Framework::Next, dir.path()).unwrap(),
            dir.path().join("out")
        );
    }
}
