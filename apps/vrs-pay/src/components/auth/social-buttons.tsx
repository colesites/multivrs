import { Github } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 11.9s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}

const PROVIDERS: Record<string, { label: string; icon: () => ReactNode }> = {
  github: { label: "GitHub", icon: () => <Github className="size-4" /> },
  google: { label: "Google", icon: GoogleIcon },
};

/** GitHub / Google buttons, only for providers the API has configured. */
export function SocialButtons({
  providers,
  disabled,
  onPick,
}: {
  providers: string[];
  disabled: boolean;
  onPick: (provider: string) => void;
}) {
  const shown = providers.filter((p) => PROVIDERS[p]);
  if (shown.length === 0) return null;
  return (
    <>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {shown.map((id) => {
          const { label, icon: Icon } = PROVIDERS[id] ?? {
            label: id,
            icon: () => <span />,
          };
          return (
            <Button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onPick(id)}
              variant="outline"
              size="lg"
            >
              <Icon /> Continue with {label}
            </Button>
          );
        })}
      </div>
      <div className="my-6 flex items-center gap-3 text-xs text-mute">
        <span className="h-px flex-1 bg-line" /> or with email{" "}
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}
