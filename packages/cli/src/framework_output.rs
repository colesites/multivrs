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
    if framework == Framework::Next {
        return next_build_output(output_dir);
    }
    if matches!(framework, Framework::Vite | Framework::Static) {
        return Ok(static_build_output(framework.id()));
    }
    if framework != Framework::SwiftRust {
        return Ok(runtime_build_output(framework));
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

fn runtime_build_output(framework: Framework) -> BuildOutputPayload {
    let (entrypoint, runtime, static_dir) = match framework {
        Framework::Remix => ("server.js", "bun", "client"),
        Framework::Hono | Framework::H3 | Framework::Node => ("server.js", "bun", "."),
        Framework::Go => ("server", "go", "."),
        Framework::Python => ("app.py", "python", "."),
        Framework::Ruby => ("app.rb", "ruby", "."),
        _ => unreachable!("runtime output called for a non-runtime framework"),
    };
    BuildOutputPayload {
        framework: framework.id().to_string(),
        static_dir: static_dir.to_string(),
        functions: vec![serde_json::json!({
            "name": "server",
            "entrypoint": entrypoint,
            "runtime": runtime,
        })],
        routes: vec![BuildRoutePayload {
            src: "/(.*)".to_string(),
            target: serde_json::json!({ "type": "function", "function": "server" }),
        }],
    }
}

fn next_build_output(output_dir: &Path) -> Result<BuildOutputPayload> {
    let entrypoint = output_dir.join("worker.js");
    if !entrypoint.exists() {
        anyhow::bail!("OpenNext output is missing .open-next/worker.js");
    }
    Ok(BuildOutputPayload {
        framework: "nextjs".to_string(),
        static_dir: "assets".to_string(),
        functions: vec![serde_json::json!({
            "name": "server",
            "entrypoint": "worker.js",
            "runtime": "edge",
        })],
        routes: vec![BuildRoutePayload {
            src: "/(.*)".to_string(),
            target: serde_json::json!({ "type": "function", "function": "server" }),
        }],
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
