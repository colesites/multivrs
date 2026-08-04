"use client";

import { Building2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const ROLES = ["admin", "developer", "viewer", "billing"] as const;

export function OrganizationManager() {
  const { data: organizations, refetch } = authClient.useListOrganizations();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [activeId, setActiveId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("developer");
  const [loading, setLoading] = useState(false);
  const selectedId = activeId || organizations?.[0]?.id || "";

  function createWorkspace() {
    if (!name.trim() || !slug.trim() || loading) return;
    setLoading(true);
    void authClient.organization
      .create({ name: name.trim(), slug: slug.trim() })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "Workspace creation failed.");
          return;
        }
        setName("");
        setSlug("");
        setActiveId(result.data.id);
        void refetch();
      })
      .catch(() => toast.error("Workspace creation failed."))
      .finally(() => setLoading(false));
  }

  function invite() {
    if (!selectedId || !email.trim() || loading) return;
    setLoading(true);
    void authClient.organization
      .inviteMember({ email: email.trim(), organizationId: selectedId, role })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "Invitation failed.");
          return;
        }
        setEmail("");
        toast.success("Invitation sent.");
      })
      .catch(() => toast.error("Invitation failed."))
      .finally(() => setLoading(false));
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70"
      aria-labelledby="workspace-title"
    >
      <div className="border-b border-(--hairline) px-5 py-4">
        <h2 className="text-sm font-semibold" id="workspace-title">
          Workspaces and team seats
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Assign admin, developer, viewer, or billing access.
        </p>
      </div>
      <div className="p-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Create workspace</h3>
          <Label htmlFor="workspace-name">Name</Label>
          <Input
            id="workspace-name"
            onChange={(event) => {
              setName(event.target.value);
              if (!slug)
                setSlug(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""),
                );
            }}
            value={name}
          />
          <Label htmlFor="workspace-slug">Slug</Label>
          <Input
            id="workspace-slug"
            onChange={(event) => setSlug(event.target.value)}
            value={slug}
          />
          <Button
            disabled={loading || !name || !slug}
            onClick={createWorkspace}
          >
            Create workspace
          </Button>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Invite member</h3>
          <Label htmlFor="workspace-select">Workspace</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            id="workspace-select"
            onChange={(event) => setActiveId(event.target.value)}
            value={selectedId}
          >
            {(organizations ?? []).map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
          <Label htmlFor="member-email">Email</Label>
          <Input
            id="member-email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
          <Label htmlFor="member-role">Role</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize"
            id="member-role"
            onChange={(event) => {
              if (isOrganizationRole(event.target.value)) {
                setRole(event.target.value);
              }
            }}
            value={role}
          >
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Button disabled={loading || !selectedId || !email} onClick={invite}>
            <UserPlus className="size-4" />
            Send invitation
          </Button>
        </div>
      </div>
    </section>
  );
}

function isOrganizationRole(value: string): value is (typeof ROLES)[number] {
  return ROLES.some((role) => role === value);
}
