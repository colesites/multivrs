import type { FrameworkId } from "@multivrs/config";

export interface EnvironmentDraft {
  id: string;
  key: string;
  value: string;
}

export interface DeploymentImportConfig {
  buildCommand: string;
  environment: EnvironmentDraft[];
  framework: FrameworkId;
  installCommand: string;
  outputDirectory: string;
  projectName: string;
  rootDirectory: string;
}

export interface RepositorySource {
  branch: string;
  name: string;
  owner: string;
  team: string;
  url: string;
}
