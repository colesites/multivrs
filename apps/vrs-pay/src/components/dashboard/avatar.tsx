import { useState } from "react";

const SIZES = { sm: "size-8 text-xs", lg: "size-14 text-base" } as const;

/** "Ada Studio" → "AS". */
export function Initials({
  name,
  size = "sm",
}: {
  name: string;
  size?: keyof typeof SIZES;
}) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-brand-50 font-medium text-brand-700 ring-1 ring-brand-100 ${SIZES[size]}`}
    >
      {letters || "?"}
    </span>
  );
}

/**
 * The signed-in person's picture from Google or GitHub, or their initials
 * when there's none (or it fails to load).
 */
export function UserAvatar({
  name,
  image,
  size = "sm",
}: {
  name: string;
  image: string | null;
  size?: keyof typeof SIZES;
}) {
  const [broken, setBroken] = useState(false);
  if (!image || broken) return <Initials name={name} size={size} />;
  return (
    <img
      src={image}
      alt=""
      // Google's avatar host refuses requests that carry a referrer.
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className={`shrink-0 rounded-full object-cover ring-1 ring-line ${SIZES[size]}`}
    />
  );
}
