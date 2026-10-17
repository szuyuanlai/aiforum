"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Send, Trophy } from "lucide-react";
import Avatar from "@/components/Avatar";
import AiSummary from "@/components/AiSummary";
import RatingBadge from "@/components/RatingBadge";
import RelativeTime from "@/components/RelativeTime";
import { useForum } from "@/lib/forum-store";
import type { Comment } from "@/lib/types";

const FEATURED_MIN_SCORE = 4;
const COMMENT_MAX_LENGTH = 1000;

/** 精選留言：AI 邏輯評分最高且不低於 4 分者 */
export function pickFeatured(comments: Comment[]): Comment | null {
  let best: Comment | null = null;
  for (const c of comments) {
    if (c.ai_rating >= FEATURED_MIN_SCORE && (!best || c.ai_rating > best.ai_rating)) best = c;
  }
  return best;
}

export function CommentItem({ comment, featured = false }: { comment: Comment; featured?: boolean }) {
  const { getProfileById } = useForum();
  const author = getProfileById(comment.author_id);
  if (!author) return null;

  return (
    <li
      className={`rounded-xl border p-4 ${
        featured ? "border-amber-500/30 bg-amber-500/5" : "border-zinc-800 bg-zinc-900/40"
      }`}
    >
      {featured && (
        <div className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          精選留言
        </div>
      )}
      <div className="flex items-start gap-3">
        <Link href={`/user/${author.username}`} className="shrink-0">
          <Avatar name={author.display_name} src={author.avatar_url} className="h-9 w-9" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 text-sm">
              <Link href={`/user/${author.username}`} className="font-semibold text-zinc-100 hover:underline">
                {author.display_name}
              </Link>
              <span className="ml-2 text-zinc-500">
                @{author.username} · <RelativeTime iso={comment.created_at} />
              </span>
            </div>
            <RatingBadge score={comment.ai_rating} label="本則 AI 邏輯" size="sm" />
          </div>
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-zinc-300">
            {comment.content}
          </p>
          <div className="mt-3">
            <AiSummary text={comment.ai_summary} source={comment.ai_source} label="AI 評語" compact />
          </div>
        </div>
      </div>
    </li>
  );
}

export default function CommentSection({ postId }: { postId: string }) {
  const { comments, currentUser, addComment, requireLogin } = useForum();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { featured, rest } = useMemo(() => {
    const list = comments
      .filter((c) => c.post_id === postId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    const top = pickFeatured(list);
    return { featured: top, rest: top ? list.filter((c) => c.id !== top.id) : list };
  }, [comments, postId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !text.trim()) return;
    if (!requireLogin()) return;
    setBusy(true);
    setError(null);
    const result = await addComment(postId, text);
    setBusy(false);
    if (result.ok) setText("");
    else setError(result.error);
  };

  return (
    <section aria-label="留言區" className="space-y-3">
      {featured || rest.length > 0 ? (
        <ul className="space-y-3">
          {featured && <CommentItem comment={featured} featured />}
          {rest.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </ul>
      ) : (
        <p className="py-2 text-sm text-zinc-500">還沒有留言，成為第一個分享觀點的人吧。</p>
      )}

      <form onSubmit={onSubmit} className="space-y-2">
        <label htmlFor={`comment-${postId}`} className="sr-only">
          留言內容
        </label>
        <textarea
          id={`comment-${postId}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="分享你的觀點，讓討論更完整..."
          className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500" role={error ? "alert" : "status"}>
            {error ? <span className="text-rose-400">{error}</span> : busy ? "AI 正在評估邏輯品質…" : currentUser ? "留言將由 AI 給出邏輯評分與短評" : "登入後即可留言"}
          </p>
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            送出留言
          </button>
        </div>
      </form>
    </section>
  );
}
