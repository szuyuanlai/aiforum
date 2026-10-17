"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

export default function NewPostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    // TODO: 之後串接 Supabase 寫入文章，並呼叫 AI 產生邏輯評分與摘要
    setSubmitted(true);
    setTitle("");
    setContent("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
    >
      <div className="space-y-2">
        <label htmlFor="post-title" className="text-sm font-medium text-zinc-300">
          文章標題
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSubmitted(false);
          }}
          placeholder="輸入一個清楚的論點或問題…"
          maxLength={120}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="post-content" className="text-sm font-medium text-zinc-300">
          內文
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSubmitted(false);
          }}
          placeholder="陳述你的前提、推論與結論，AI 會評估邏輯品質…"
          rows={6}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500" role="status">
          {submitted ? "✅ 已送出（目前為 UI 示範，尚未串接資料庫）" : "送出後 AI 將自動給出 1–5 星邏輯評分與摘要"}
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          發布文章
        </button>
      </div>
    </form>
  );
}
