import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface SidebarHeaderProps {
  displayName?: string;
  image?: string | null;
  plan?: string;
}

/**
 * Sidebar top region — the workspace switcher. Fixed to h-14 with a bottom
 * hairline so its separator lines up exactly with the content topbar's.
 */
export function SidebarHeader({
  displayName,
  image,
  plan,
}: SidebarHeaderProps) {
  return (
    <div className="flex h-14 shrink-0 items-center border-b border-[var(--hairline)] px-3">
      <WorkspaceSwitcher displayName={displayName} image={image} plan={plan} />
    </div>
  );
}
