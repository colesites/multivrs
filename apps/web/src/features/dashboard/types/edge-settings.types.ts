export type CacheMode = "smart" | "bypass" | "aggressive";

export interface EdgeSettingsData {
  analyticsEnabled: boolean;
  attackMode: boolean;
  browserTtl: number;
  cacheMode: CacheMode;
  edgeTtl: number;
  speedInsightsEnabled: boolean;
  updatedAt: string | null;
}
