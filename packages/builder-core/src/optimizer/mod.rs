use anyhow::{Context, Result};
use rayon::prelude::*;
use std::path::{Path, PathBuf};

mod external;
mod images;
mod report;

pub use report::OptimizationReport;

use external::{optimize_font, optimize_video};
use images::optimize_image;

enum AssetKind {
    Image,
    Video,
    Font,
}

pub fn optimize_assets(root: &Path) -> Result<OptimizationReport> {
    let assets = discover_assets(root)?;
    let reports = assets
        .par_iter()
        .map(|(path, kind)| match kind {
            AssetKind::Image => optimize_image(path),
            AssetKind::Video => optimize_video(path),
            AssetKind::Font => optimize_font(path),
        })
        .collect::<Result<Vec<_>>>()?;
    Ok(reports
        .into_iter()
        .fold(OptimizationReport::default(), |mut total, item| {
            total.merge(item);
            total
        }))
}

fn discover_assets(root: &Path) -> Result<Vec<(PathBuf, AssetKind)>> {
    let mut assets = Vec::new();
    for entry in walkdir::WalkDir::new(root) {
        let entry = entry.context("failed to inspect build assets")?;
        if !entry.file_type().is_file() || is_variant(entry.path()) {
            continue;
        }
        let extension = entry.path().extension().and_then(|value| value.to_str());
        let kind = match extension.map(str::to_ascii_lowercase).as_deref() {
            Some("jpg" | "jpeg" | "png") => Some(AssetKind::Image),
            Some("mp4" | "mov" | "m4v") => Some(AssetKind::Video),
            Some("ttf" | "otf") => Some(AssetKind::Font),
            _ => None,
        };
        if let Some(kind) = kind {
            assets.push((entry.into_path(), kind));
        }
    }
    Ok(assets)
}

fn is_variant(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|value| value.to_str()),
        Some("webp" | "webm" | "woff2")
    )
}
