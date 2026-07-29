import { unstable_rethrow } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { githubRepositorySchema } from "@/lib/schemas/github.schemas";
import { logError } from "@/lib/services/logger.service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    let token: string | null = null;
    const githubUsername =
      session?.user.displayUsername || session?.user.username || null;
    let isGitHubConnected = false;

    if (session) {
      try {
        const credentials = await auth.api.getAccessToken({
          body: { providerId: "github" },
          headers: req.headers,
        });
        token = credentials.accessToken;
        isGitHubConnected = true;
      } catch {}
    }

    // Try fetching with OAuth access token
    if (token) {
      const ghRes = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=50",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Multivrs-App",
          },
        },
      );

      if (ghRes.ok) {
        const repos = githubRepositorySchema.array().parse(await ghRes.json());
        const formatted = repos.map((repo) => ({
          ...repo,
          is_turbo:
            repo.name === "multivrs" ||
            repo.name === "kontinueai" ||
            repo.name === "swift-rust",
        }));
        return NextResponse.json({
          connected: true,
          repos: formatted,
          owner: repos[0]?.owner?.login ?? githubUsername ?? "colesites",
        });
      }
    }

    // Fallback: Fetch public repositories for the username or default team
    const targetUser = githubUsername || "colesites";
    const publicRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(targetUser)}/repos?sort=updated&per_page=30`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Multivrs-App",
        },
      },
    );

    if (publicRes.ok) {
      const repos = githubRepositorySchema
        .array()
        .parse(await publicRes.json());
      const formatted = repos.map((repo) => ({
        ...repo,
        is_turbo:
          repo.name === "multivrs" ||
          repo.name === "kontinueai" ||
          repo.name === "swift-rust",
      }));
      return NextResponse.json({
        connected: isGitHubConnected,
        repos: formatted,
        owner: targetUser,
      });
    }

    return NextResponse.json({
      connected: isGitHubConnected,
      repos: [],
      owner: targetUser,
    });
  } catch (err: unknown) {
    unstable_rethrow(err);
    logError("github.repositories.fetch_failed", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch GitHub repositories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
