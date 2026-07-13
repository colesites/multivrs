use anyhow::{Result, bail};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct ApiErrorBody {
    error: ApiErrorMessage,
}

#[derive(Debug, Deserialize)]
struct ApiErrorMessage {
    message: String,
}

#[derive(Debug, Deserialize)]
pub(crate) struct Deployment {
    pub(crate) id: String,
    pub(crate) url: Option<String>,
}

pub(crate) struct ApiClient {
    pub(crate) base_url: String,
    pub(crate) token: String,
    pub(crate) http: Client,
}

impl ApiClient {
    pub(crate) fn new(token: String) -> Self {
        Self {
            base_url: std::env::var("MULTIVRS_API_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string())
                .trim_end_matches('/')
                .to_string(),
            token,
            http: Client::new(),
        }
    }

    pub(crate) fn create_deployment(&self, project_id: &str, target: &str) -> Result<Deployment> {
        self.post(
            &format!("/api/projects/{project_id}/deployments"),
            &serde_json::json!({ "target": target }),
        )
    }

    pub(crate) fn update_status(
        &self,
        project_id: &str,
        deployment_id: &str,
        status: &str,
        message: Option<&str>,
    ) -> Result<Deployment> {
        let body = match message {
            Some(message) => serde_json::json!({ "status": status, "message": message }),
            None => serde_json::json!({ "status": status }),
        };
        self.post(
            &format!("/api/projects/{project_id}/deployments/{deployment_id}/status"),
            &body,
        )
    }

    pub(crate) fn append_log(
        &self,
        project_id: &str,
        deployment_id: &str,
        level: &str,
        message: &str,
    ) -> Result<serde_json::Value> {
        self.post(
            &format!("/api/projects/{project_id}/deployments/{deployment_id}/logs"),
            &serde_json::json!({ "level": level, "message": crate::deploy::truncate_log(message) }),
        )
    }

    pub(crate) fn post<T: for<'de> Deserialize<'de>, B: Serialize>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T> {
        let response = self
            .http
            .post(format!("{}{}", self.base_url, path))
            .bearer_auth(&self.token)
            .json(body)
            .send()?;
        let status = response.status();
        if !status.is_success() {
            let message = response
                .json::<ApiErrorBody>()
                .map(|body| body.error.message)
                .unwrap_or_else(|_| format!("request failed ({status})"));
            bail!(message);
        }
        Ok(response.json()?)
    }
}
