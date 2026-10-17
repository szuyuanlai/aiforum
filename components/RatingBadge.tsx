import { Star } from "lucide-react";

function tone(score: number): string {
  if (score >= 4.5) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (score >= 3.5) return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  if (score >= 2.5) return "border-orange-500/40 bg-orange-500/10 text-orange-300";
  return "border-rose-500/40 bg-rose-500/10 text-rose-300";
}

interface RatingBadgeProps {
  score: number;
  /** 例如「本篇 AI 邏輯」或「本則 AI 邏輯」 */
  label?: string;
  size?: "sm" | "md";
}

/** 「⭐ 4.8 / 5」徽章 */
export default function RatingBadge({ score, label, size = "md" }: RatingBadgeProps) {
  const pad = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${pad} ${tone(score)}`}
      title={`AI 邏輯評分 ${score.toFixed(1)} / 5`}
    >
      {label && <span className="text-zinc-400">{label}</span>}
      <Star className={size === "md" ? "h-4 w-4 fill-current" : "h-3.5 w-3.5 fill-current"} aria-hidden="true" />
      <span className="tabular-nums">
        {score.toFixed(1)} <span className="text-zinc-500">/ 5</span>
      </span>
    </div>
  );
}
