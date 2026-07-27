import { KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";

export function ApiTokenList({
  tokens,
  onRevoke,
}: {
  tokens: ApiTokenSummary[];
  onRevoke(id: string): void;
}) {
  return (
    <section className="divide-y divide-border border-y border-border">
      {tokens.length === 0 ? (
        <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
          <KeyRound className="size-5" /> No developer tokens
        </div>
      ) : (
        tokens.map((token) => (
          <div key={token.id} className="flex items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{token.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {token.hint}
              </p>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {token.lastUsedAt
                ? `Used ${new Date(token.lastUsedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}`
                : "Never used"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRevoke(token.id)}
              title="Revoke token"
            >
              <Trash2 />
            </Button>
          </div>
        ))
      )}
    </section>
  );
}
