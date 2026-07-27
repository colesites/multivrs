use anyhow::{Result, bail};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Framework {
    Next,
    SwiftRust,
    Remix,
    Hono,
    H3,
    Node,
    Go,
    Python,
    Ruby,
    Vite,
    Static,
}

impl Framework {
    pub(crate) fn from_id(id: &str) -> Result<Self> {
        match id {
            "nextjs" => Ok(Self::Next),
            "swift-rust" => Ok(Self::SwiftRust),
            "remix" => Ok(Self::Remix),
            "hono" => Ok(Self::Hono),
            "h3" => Ok(Self::H3),
            "node" => Ok(Self::Node),
            "go" => Ok(Self::Go),
            "python" => Ok(Self::Python),
            "ruby" => Ok(Self::Ruby),
            "vite" => Ok(Self::Vite),
            "static" => Ok(Self::Static),
            other => bail!("Unsupported framework preset: {other}"),
        }
    }

    pub(crate) fn name(self) -> &'static str {
        match self {
            Self::Next => "Next.js",
            Self::SwiftRust => "swift-rust",
            Self::Remix => "Remix",
            Self::Hono => "Hono",
            Self::H3 => "h3",
            Self::Node => "Node.js",
            Self::Go => "Go",
            Self::Python => "Python",
            Self::Ruby => "Ruby",
            Self::Vite => "Vite",
            Self::Static => "static",
        }
    }

    pub(crate) fn build_command(self) -> Option<String> {
        let bun = bun_binary();
        match self {
            Self::Next => Some(format!("NODE_ENV=production {bun} x @opennextjs/cloudflare build")),
            Self::SwiftRust => Some(format!("NODE_ENV=production {bun} x swift-rust build")),
            Self::Remix => Some(format!("NODE_ENV=production {bun} run build && mkdir -p .multivrs-output/client && {bun} build build/server/index.js --target=bun --outfile .multivrs-output/server.js && cp -R build/client/. .multivrs-output/client")),
            Self::Hono | Self::H3 | Self::Node => Some(format!("mkdir -p .multivrs-output && ENTRY=server.ts; test -f server.ts || ENTRY=server.js; {bun} build $ENTRY --target=bun --outfile .multivrs-output/server.js")),
            Self::Go => Some("mkdir -p .multivrs-output && go build -o .multivrs-output/server .".to_string()),
            Self::Python => Some("mkdir -p .multivrs-output/vendor && python3 -m pip install -r requirements.txt --target .multivrs-output/vendor && cp app.py .multivrs-output/app.py".to_string()),
            Self::Ruby => Some("mkdir -p .multivrs-output && bundle config set path .multivrs-output/vendor/bundle && bundle install && cp app.rb Gemfile .multivrs-output/".to_string()),
            Self::Vite => Some(format!("NODE_ENV=production {bun} x vite build")),
            Self::Static => None,
        }
    }

    pub(crate) fn output_dir(self) -> &'static str {
        match self {
            Self::Next => ".open-next",
            Self::SwiftRust | Self::Vite => "dist",
            Self::Remix
            | Self::Hono
            | Self::H3
            | Self::Node
            | Self::Go
            | Self::Python
            | Self::Ruby => ".multivrs-output",
            Self::Static => ".",
        }
    }

    pub(crate) fn id(self) -> &'static str {
        match self {
            Self::Next => "nextjs",
            Self::SwiftRust => "swift-rust",
            Self::Remix => "remix",
            Self::Hono => "hono",
            Self::H3 => "h3",
            Self::Node => "node",
            Self::Go => "go",
            Self::Python => "python",
            Self::Ruby => "ruby",
            Self::Vite => "vite",
            Self::Static => "static",
        }
    }
}

pub(crate) fn resolve_output_dir(framework: Framework, root: &Path) -> Result<PathBuf> {
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
    if package_json.contains("\"@remix-run/dev\"") || root.join("remix.config.ts").exists() {
        return Ok(Framework::Remix);
    }
    if package_json.contains("\"hono\"") {
        return Ok(Framework::Hono);
    }
    if package_json.contains("\"h3\"") {
        return Ok(Framework::H3);
    }
    if package_json.contains("\"vite\"") || root.join("vite.config.ts").exists() {
        return Ok(Framework::Vite);
    }
    if root.join("go.mod").exists() {
        return Ok(Framework::Go);
    }
    if root.join("requirements.txt").exists() || root.join("pyproject.toml").exists() {
        return Ok(Framework::Python);
    }
    if root.join("Gemfile").exists() {
        return Ok(Framework::Ruby);
    }
    if root.join("server.ts").exists() || root.join("server.js").exists() {
        return Ok(Framework::Node);
    }
    if root.join("index.html").exists() {
        return Ok(Framework::Static);
    }
    bail!("Could not detect a deployable framework.");
}

pub(crate) fn detect_install_command(root: &Path) -> Option<String> {
    let bun = bun_binary();
    if root.join("bun.lock").exists() || root.join("bun.lockb").exists() {
        return Some(format!(
            "NODE_ENV=development {bun} install --frozen-lockfile"
        ));
    }
    if root.join("pnpm-lock.yaml").exists() {
        return Some("pnpm install --frozen-lockfile --prod=false".to_string());
    }
    if root.join("yarn.lock").exists() {
        return Some("NODE_ENV=development yarn install --frozen-lockfile".to_string());
    }
    if root.join("package-lock.json").exists() {
        return Some("npm ci --include=dev".to_string());
    }
    if root.join("package.json").exists() {
        return Some("npm install --include=dev".to_string());
    }
    None
}

fn bun_binary() -> String {
    std::env::var("MULTIVRS_BUN_BINARY")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .map(|value| format!("'{}'", value.replace('\'', "'\\''")))
        .unwrap_or_else(|| "bun".to_string())
}

#[cfg(test)]
mod tests {
    use super::{Framework, detect_framework, detect_install_command};
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn bun_installs_include_build_dependencies() {
        let root = tempdir().expect("temp directory");
        fs::write(root.path().join("bun.lock"), "").expect("lock file");
        let command = detect_install_command(root.path()).expect("install command");
        assert!(command.contains("NODE_ENV=development"));
        assert!(command.contains("--frozen-lockfile"));
    }

    #[test]
    fn next_build_uses_open_next_runtime() {
        let command = Framework::Next.build_command().expect("build command");
        assert!(command.contains("@opennextjs/cloudflare build"));
        assert_eq!(Framework::Next.output_dir(), ".open-next");
    }

    #[test]
    fn detects_swift_rust_before_vite() {
        let root = tempdir().expect("temp directory");
        fs::write(
            root.path().join("package.json"),
            r#"{"dependencies":{"swift-rust":"1.0.0","vite":"1.0.0"}}"#,
        )
        .expect("package file");
        assert_eq!(
            detect_framework(root.path()).expect("framework"),
            Framework::SwiftRust
        );
    }
}
