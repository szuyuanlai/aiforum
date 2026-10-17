"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function NewPostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    // TODO: 之後串接 Supabase 寫入文章，並呼叫 AI 產生評分與摘要。
    setSubmitted(true);
    setTitle("");
    setContent("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
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
          placeholder="輸入文章標題"
          maxLength={120}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="post-content" className="text-sm font-medium text-zinc-300">
          文章內文
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSubmitted(false);
          }}
          placeholder="分享你的論點，AI 會為你的邏輯評分..."
          rows={6}
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">
          {submitted ? "已送出（示範用，尚未串接後端）。" : "送出後將由 AI 進行邏輯評分。"}
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          發布文章
        </button>
      </div>
    </form>
  );
}
