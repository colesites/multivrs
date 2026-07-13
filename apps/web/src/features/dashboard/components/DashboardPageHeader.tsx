interface DashboardPageHeaderProps {
  title: string;
  description?: string;
}

export function DashboardPageHeader({
  title,
  description,
}: DashboardPageHeaderProps) {
  return (
    <header className="border-b border-[var(--hairline)] px-5 py-5">
      <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
