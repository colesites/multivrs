"use client";

import { useEffect, useState } from "react";
import { readableError, requestOk } from "@/lib/api/request.client";
import {
  type GitHubRepository,
  githubRepositoriesResponseSchema,
} from "@/lib/schemas/github.schemas";

export function useGithubRepositories() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState("github");
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  useEffect(() => {
    let active = true;
    void requestOk(
      "/api/github/repos",
      {},
      "GitHub repositories could not be loaded",
    )
      .then((response) => response.json())
      .then((body) => githubRepositoriesResponseSchema.parse(body))
      .then((result) => {
        if (!active) return;
        setConnected(result.connected);
        setOwner(result.owner);
        setRepositories(result.repos);
        if (!result.repos.length)
          setError("No repositories were returned by GitHub.");
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            readableError(cause, "GitHub repositories could not be loaded"),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return { connected, error, loading, owner, repositories };
}
