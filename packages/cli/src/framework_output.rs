use anyhow::{Context, Result};
use builder_core::{BuildOutputPayload, BuildRoutePayload};
use serde::Deserialize;
use std::fs;
use std::path::Path;

use crate::framework::Framework;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SwiftManifest {
    binary: String,
    static_dir: String,
    routes: Vec<SwiftRoute>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SwiftRoute {
    src: String,
    render_mode: String,
    runtime: Option<String>,
}

pub(crate) fn resolve_build_output(
    framework: Framework,
    output_dir: &Path,
) -> Result<BuildOutputPayload> {
    if framework != Framework::SwiftRust {
        return Ok(static_build_output(framework.id()));
    }
    let text = fs::read_to_string(output_dir.join("multivrs-build.json"))
        .context("swift-rust output is missing multivrs-build.json")?;
    let manifest: SwiftManifest = serde_json::from_str(&text)?;
    let has_compute = manifest
        .routes
        .iter()
        .any(|route| route.render_mode != "wasm");
    let runtime = manifest
        .routes
        .iter()
        .find_map(|route| route.runtime.clone())
        .unwrap_or_else(|| "bun".to_string());
    let routes = manifest
        .routes
        .into_iter()
        .map(|route| BuildRoutePayload {
            src: route.src,
            target: if route.render_mode == "wasm" {
                serde_json::json!({ "type": "static" })
            } else {
                serde_json::json!({ "type": "function", "function": "server" })
            },
        })
        .collect();
    Ok(BuildOutputPayload {
        framework: framework.id().to_string(),
        static_dir: manifest.static_dir,
        functions: if has_compute {
            vec![serde_json::json!({
                "name": "server",
                "entrypoint": manifest.binary,
                "runtime": runtime,
            })]
        } else {
            Vec::new()
        },
        routes,
    })
}

pub(crate) fn static_build_output(framework: &str) -> BuildOutputPayload {
    BuildOutputPayload {
        framework: framework.to_string(),
        static_dir: ".".to_string(),
        functions: Vec::new(),
        routes: vec![BuildRoutePayload {
            src: "/(.*)".to_string(),
            target: serde_json::json!({ "type": "static" }),
        }],
    }
}
