import { z } from "zod";

const repository = z.object({
  default_branch: z.string().min(1),
  full_name: z.string().min(3),
});

export const githubPushSchema = z.object({
  after: z.string().min(7).max(64),
  ref: z.string().startsWith("refs/heads/"),
  repository,
});

export const githubPullRequestSchema = z.object({
  action: z.enum(["opened", "reopened", "synchronize"]),
  pull_request: z.object({
    head: z.object({ ref: z.string().min(1), sha: z.string().min(7).max(64) }),
  }),
  repository,
});
