export interface ContentSettingsData {
  cacheVersion: string;
  defaultRevalidate: number;
  staleWindow: number;
  updatedAt: string | null;
}

export interface BulkRedirectData {
  destination: string;
  enabled: boolean;
  id: string;
  preserveQuery: boolean;
  priority: number;
  source: string;
  statusCode: 301 | 302 | 307 | 308;
}

export interface EdgeConfigEntryData {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface MicrofrontendRouteData {
  enabled: boolean;
  id: string;
  priority: number;
  source: string;
  stripPrefix: boolean;
  targetProjectId: string;
  targetProjectName: string;
}

export interface BlobData {
  contentType: string;
  createdAt: string;
  id: string;
  pathname: string;
  size: number;
  status: "pending" | "ready" | "failed";
  visibility: "public" | "private";
}

export interface ContentPlatformData {
  blobs: BlobData[];
  edgeConfig: EdgeConfigEntryData[];
  microfrontends: MicrofrontendRouteData[];
  redirects: BulkRedirectData[];
  settings: ContentSettingsData;
  targetProjects: Array<{ id: string; name: string }>;
}
