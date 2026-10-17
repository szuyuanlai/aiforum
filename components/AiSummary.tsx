import { Sparkles } from "lucide-react";
import type { AiSource } from "@/lib/types";

const SOURCE_LABEL: Record<AiSource, string> = {
  openai: "OpenAI",
  fallback: "規則引擎",
  seed: "範例",
};

interface AiSummaryProps {
  text: string;
  source: AiSource;
  /** 區塊標題，例如「AI 摘要」或「AI 評語」 */
  label?: string;
  compact?: boolean;
}

/** AI 短評 / 摘要的特殊樣式區塊 */
export default function AiSummary({ text, source, label = "AI 摘要", compact = false }: AiSummaryProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-transparent ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-400 to-violet-500" aria-hidden="true" />
      <div className="flex items-center gap-2 pl-2 text-xs font-semibold text-indigo-300">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-200">
          {SOURCE_LABEL[source]}
        </span>
      </div>
      <p className={`mt-1.5 pl-2 leading-relaxed text-indigo-100/90 ${compact ? "text-xs" : "text-sm"}`}>{text}</p>
    </div>
  );
}
