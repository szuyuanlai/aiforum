"use client";

import { useState } from "react";

const GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-pink-500 to-rose-600",
];

function gradientFor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

interface AvatarProps {
  name: string;
  src: string | null;
  /** Tailwind 尺寸 class，例如 "h-10 w-10" */
  className?: string;
  textClassName?: string;
}

export default function Avatar({ name, src, className = "h-10 w-10", textClassName = "text-sm" }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src ?? undefined}
        alt={`${name} 的頭貼`}
        onError={() => setFailedSrc(src)}
        className={`${className} shrink-0 rounded-full border border-zinc-700 object-cover`}
      />
    );
  }

  const initial = [...name.trim()][0]?.toUpperCase() ?? "?";
  return (
    <span
      role="img"
      aria-label={`${name} 的頭貼`}
      className={`${className} ${textClassName} inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientFor(
        name,
      )} font-semibold text-white`}
    >
      {initial}
    </span>
  );
}
