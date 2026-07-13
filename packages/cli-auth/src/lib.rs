//! CLI credentials. The API token is stored at `~/.multivrs/auth.json`. The
//! store path is injectable so it's testable against a temp dir without touching
//! the real home directory. (Device/OAuth login flow comes later; for now a
//! token is provided directly via `multivrs login --token`.)

use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

pub const AUTH_DIR: &str = ".multivrs";
pub const AUTH_FILE: &str = "auth.json";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Credentials {
    pub token: String,
}

/// Default credentials path: `~/.multivrs/auth.json`.
pub fn default_path() -> Result<PathBuf> {
    let home = dirs::home_dir().context("could not determine home directory")?;
    Ok(home.join(AUTH_DIR).join(AUTH_FILE))
}

/// A credentials store backed by a JSON file.
pub struct Store {
    path: PathBuf,
}

impl Store {
    pub fn new(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    /// Store at the default `~/.multivrs/auth.json`.
    pub fn at_home() -> Result<Self> {
        Ok(Self::new(default_path()?))
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    pub fn load(&self) -> Result<Option<Credentials>> {
        if !self.path.exists() {
            return Ok(None);
        }
        let text = fs::read_to_string(&self.path)
            .with_context(|| format!("reading {}", self.path.display()))?;
        Ok(Some(serde_json::from_str(&text)?))
    }

    pub fn save(&self, creds: &Credentials) -> Result<()> {
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&self.path, serde_json::to_string_pretty(creds)?)?;
        // Best-effort: tighten to owner-only since this holds a secret.
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let _ = fs::set_permissions(&self.path, fs::Permissions::from_mode(0o600));
        }
        Ok(())
    }

    pub fn clear(&self) -> Result<()> {
        if self.path.exists() {
            fs::remove_file(&self.path)?;
        }
        Ok(())
    }

    pub fn is_authenticated(&self) -> bool {
        matches!(self.load(), Ok(Some(_)))
    }
}

/// Mask a token for display, keeping only the last 4 characters.
pub fn mask_token(token: &str) -> String {
    let len = token.chars().count();
    if len <= 4 {
        return "*".repeat(len);
    }
    let tail: String = token.chars().skip(len - 4).collect();
    format!("{}{}", "*".repeat(len - 4), tail)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn store() -> (tempfile::TempDir, Store) {
        let tmp = tempfile::tempdir().unwrap();
        let store = Store::new(tmp.path().join("auth.json"));
        (tmp, store)
    }

    #[test]
    fn saves_and_loads_credentials() {
        let (_tmp, store) = store();
        let creds = Credentials {
            token: "tok_secret".into(),
        };
        store.save(&creds).unwrap();
        assert_eq!(store.load().unwrap(), Some(creds));
        assert!(store.is_authenticated());
    }

    #[test]
    fn unauthenticated_before_login() {
        let (_tmp, store) = store();
        assert!(!store.is_authenticated());
        assert_eq!(store.load().unwrap(), None);
    }

    #[test]
    fn clear_removes_credentials() {
        let (_tmp, store) = store();
        store.save(&Credentials { token: "t".into() }).unwrap();
        store.clear().unwrap();
        assert!(!store.is_authenticated());
        // clearing again is a no-op
        store.clear().unwrap();
    }

    #[test]
    fn masks_all_but_last_four() {
        assert_eq!(mask_token("abcdef1234"), "******1234");
        assert_eq!(mask_token("ab"), "**");
        assert_eq!(mask_token(""), "");
    }
}
