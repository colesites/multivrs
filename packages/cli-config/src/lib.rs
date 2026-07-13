//! CLI project config. `.multivrs/project.json` links a local directory to a
//! platform project (our equivalent of Vercel's `.vercel/project.json`). The
//! deploy command resolves the link by walking up from the working directory.

use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

pub const LINK_DIR: &str = ".multivrs";
pub const LINK_FILE: &str = "project.json";

/// The link between a working directory and a platform project.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProjectLink {
    pub project_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub org_id: Option<String>,
}

/// Path to the link file under `root` (does not check existence).
pub fn link_path(root: &Path) -> PathBuf {
    root.join(LINK_DIR).join(LINK_FILE)
}

/// Write `.multivrs/project.json` under `root`, creating the dir if needed.
pub fn write_link(root: &Path, link: &ProjectLink) -> Result<()> {
    let dir = root.join(LINK_DIR);
    fs::create_dir_all(&dir).with_context(|| format!("creating {}", dir.display()))?;
    let path = dir.join(LINK_FILE);
    let json = serde_json::to_string_pretty(link)?;
    fs::write(&path, json).with_context(|| format!("writing {}", path.display()))?;
    Ok(())
}

/// Read the link under `root`, or `None` if it isn't linked.
pub fn read_link(root: &Path) -> Result<Option<ProjectLink>> {
    let path = link_path(root);
    if !path.exists() {
        return Ok(None);
    }
    let text = fs::read_to_string(&path)?;
    let link =
        serde_json::from_str(&text).with_context(|| format!("parsing {}", path.display()))?;
    Ok(Some(link))
}

/// Walk up from `start` looking for a linked directory.
pub fn find_link(start: &Path) -> Result<Option<(PathBuf, ProjectLink)>> {
    let mut current = Some(start);
    while let Some(dir) = current {
        if link_path(dir).exists()
            && let Some(link) = read_link(dir)?
        {
            return Ok(Some((dir.to_path_buf(), link)));
        }
        current = dir.parent();
    }
    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips_a_link() {
        let tmp = tempfile::tempdir().unwrap();
        let link = ProjectLink {
            project_id: "prj_123".into(),
            org_id: Some("org_9".into()),
        };
        write_link(tmp.path(), &link).unwrap();
        assert_eq!(read_link(tmp.path()).unwrap(), Some(link));
    }

    #[test]
    fn reading_an_unlinked_dir_is_none() {
        let tmp = tempfile::tempdir().unwrap();
        assert_eq!(read_link(tmp.path()).unwrap(), None);
    }

    #[test]
    fn org_id_is_omitted_when_absent() {
        let tmp = tempfile::tempdir().unwrap();
        write_link(
            tmp.path(),
            &ProjectLink {
                project_id: "prj_1".into(),
                org_id: None,
            },
        )
        .unwrap();
        let text = fs::read_to_string(link_path(tmp.path())).unwrap();
        assert!(!text.contains("org_id"));
    }

    #[test]
    fn finds_a_link_in_a_parent_directory() {
        let tmp = tempfile::tempdir().unwrap();
        write_link(
            tmp.path(),
            &ProjectLink {
                project_id: "prj_1".into(),
                org_id: None,
            },
        )
        .unwrap();
        let nested = tmp.path().join("a/b/c");
        fs::create_dir_all(&nested).unwrap();
        let (root, link) = find_link(&nested).unwrap().unwrap();
        assert_eq!(root, tmp.path());
        assert_eq!(link.project_id, "prj_1");
    }

    #[test]
    fn find_returns_none_when_unlinked() {
        let tmp = tempfile::tempdir().unwrap();
        assert!(find_link(tmp.path()).unwrap().is_none());
    }
}
