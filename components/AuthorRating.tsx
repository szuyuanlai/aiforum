import { Star } from "lucide-react";
import type { Profile } from "@/lib/types";

/** 作者歷史平均 AI 邏輯評分，例如「⭐ 4.7 / 總發文數：142 篇」 */
export default function AuthorRating({ profile, className = "" }: { profile: Profile; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-zinc-400 ${className}`}
      title="作者歷史平均 AI 邏輯評分"
    >
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-medium text-amber-300 tabular-nums">
        {profile.post_count > 0 ? profile.avg_ai_rating.toFixed(1) : "—"}
      </span>
      <span className="text-zinc-600">/</span>
      <span>總發文數：{profile.post_count} 篇</span>
    </span>
  );
}
