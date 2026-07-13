use super::OptimizationReport;
use anyhow::{Context, Result};
use image::ImageFormat;
use std::fs;
use std::path::Path;

pub(super) fn optimize_image(path: &Path) -> Result<OptimizationReport> {
    let output = variant_path(path, "webp");
    if output.exists() {
        return Ok(OptimizationReport::default());
    }
    let input_bytes = fs::metadata(path)?.len();
    let image =
        image::open(path).with_context(|| format!("failed to decode image {}", path.display()))?;
    image
        .save_with_format(&output, ImageFormat::WebP)
        .with_context(|| format!("failed to encode image {}", output.display()))?;
    Ok(OptimizationReport::created(
        input_bytes,
        fs::metadata(output)?.len(),
    ))
}

pub(super) fn variant_path(path: &Path, extension: &str) -> std::path::PathBuf {
    let mut name = path.as_os_str().to_os_string();
    name.push(format!(".{extension}"));
    name.into()
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{Rgb, RgbImage};

    #[test]
    fn creates_decodable_webp_variant() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("photo.png");
        RgbImage::from_pixel(24, 16, Rgb([12, 34, 56]))
            .save(&input)
            .unwrap();
        let report = optimize_image(&input).unwrap();
        let output = variant_path(&input, "webp");
        assert_eq!(report.created, 1);
        assert_eq!(image::open(output).unwrap().width(), 24);
    }
}
