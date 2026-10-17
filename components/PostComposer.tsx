"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import RatingBadge from "@/components/RatingBadge";
import { useForum } from "@/lib/forum-store";
import { fileToResizedDataUrl } from "@/lib/image";
import { POST_CATEGORIES, type Post, type PostCategory } from "@/lib/types";

const TITLE_MAX = 120;
const CONTENT_MAX = 5000;

export default function PostComposer() {
  const { currentUser, login, createPost, demoMode } = useForum();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("日常");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPost, setLastPost] = useState<Post | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center">
        <p className="text-sm text-zinc-300">登入後即可發表文章，AI 會自動為你的論點評分。</p>
        <button
          type="button"
          onClick={() => void login()}
          className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
        >
          使用 Google 登入
        </button>
        {demoMode && <p className="mt-2 text-xs text-zinc-500">（尚未設定 Supabase，將以示範帳號登入）</p>}
      </section>
    );
  }

  const canSubmit = !busy && title.trim().length > 0 && content.trim().length > 0;

  const onPickImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = await fileToResizedDataUrl(file, 1200);
    if (result.ok) {
      setImage(result.dataUrl);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setLastPost(null);
    const result = await createPost({ title, content, category, image_url: image });
    setBusy(false);
    if (result.ok) {
      setLastPost(result.data);
      setTitle("");
      setContent("");
      setImage(null);
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Avatar name={currentUser.display_name} src={currentUser.avatar_url} className="h-11 w-11" />
        <div className="min-w-0 flex-1 space-y-3">
          <label htmlFor="post-title" className="sr-only">
            文章標題
          </label>
          <input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            placeholder="用一句話說出你的論點或問題…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <label htmlFor="post-content" className="sr-only">
            文章內文
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={CONTENT_MAX}
            rows={5}
            placeholder="陳述你的前提、推論與結論，AI 會評估你的邏輯品質…"
            className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          {image && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="已選擇的圖片預覽" className="max-h-48 rounded-lg border border-zinc-700" />
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label="移除圖片"
                className="absolute -right-2 -top-2 rounded-full bg-zinc-900 p-1 text-zinc-300 ring-1 ring-zinc-700 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="post-category" className="sr-only">
              分類
            </label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={onPickImage} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              加入圖片
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {busy ? "AI 評分中…" : "發布文章"}
            </button>
          </div>

          <div role={error ? "alert" : "status"} className="min-h-5 text-xs">
            {error && <p className="text-rose-400">{error}</p>}
            {lastPost && (
              <div className="flex flex-wrap items-center gap-2 text-zinc-400">
                <span>已發布！AI 評分：</span>
                <RatingBadge score={lastPost.ai_rating} size="sm" />
                <span className="text-zinc-500">{lastPost.ai_summary}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
