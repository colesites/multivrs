/** Shared eyebrow, title and lead-in for the /emails page sections. */
export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mb-12 max-w-2xl lg:mb-16">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
