//! `multivrs` — the single-binary deploy CLI.

mod api;
mod artifact_upload;
mod deploy;
mod framework;
mod framework_output;

use anyhow::Result;
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "multivrs", version, about = "Deploy to Multivrs")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Log in by storing an API token.
    Login {
        #[arg(long)]
        token: String,
    },
    /// Remove stored credentials.
    Logout,
    /// Show the current login.
    Whoami,
    /// Link the current directory to a project.
    Link {
        #[arg(long)]
        project: String,
        #[arg(long)]
        org: Option<String>,
    },
    /// Build and deploy the current directory.
    Deploy {
        /// Promote to production after a successful upload.
        #[arg(long)]
        prod: bool,
    },
}

fn main() -> Result<()> {
    match Cli::parse().command {
        Command::Login { token } => {
            cli_auth::Store::at_home()?.save(&cli_auth::Credentials { token })?;
            println!("Logged in.");
        }
        Command::Logout => {
            cli_auth::Store::at_home()?.clear()?;
            println!("Logged out.");
        }
        Command::Whoami => match cli_auth::Store::at_home()?.load()? {
            Some(creds) => println!("Logged in (token {}).", cli_auth::mask_token(&creds.token)),
            None => anyhow::bail!("Not logged in. Run `multivrs login --token <token>`."),
        },
        Command::Link { project, org } => {
            let cwd = std::env::current_dir()?;
            cli_config::write_link(
                &cwd,
                &cli_config::ProjectLink {
                    project_id: project,
                    org_id: org,
                },
            )?;
            println!("Linked {} to a project.", cwd.display());
        }
        Command::Deploy { prod } => deploy::deploy(prod)?,
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn cli_definition_is_valid() {
        Cli::command().debug_assert();
    }

    #[test]
    fn deploy_defaults_to_preview() {
        let cli = Cli::try_parse_from(["multivrs", "deploy"]).unwrap();
        assert!(matches!(cli.command, Command::Deploy { prod: false }));
        let prod = Cli::try_parse_from(["multivrs", "deploy", "--prod"]).unwrap();
        assert!(matches!(prod.command, Command::Deploy { prod: true }));
    }

    #[test]
    fn requires_a_subcommand() {
        assert!(Cli::try_parse_from(["multivrs"]).is_err());
    }
}
