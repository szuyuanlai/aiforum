"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Heart, Link2, MessageCircle, Repeat2 } from "lucide-react";
import AiSummary from "@/components/AiSummary";
import AuthorRating from "@/components/AuthorRating";
import Avatar from "@/components/Avatar";
import CommentSection, { CommentItem, pickFeatured } from "@/components/CommentSection";
import RatingBadge from "@/components/RatingBadge";
import RelativeTime from "@/components/RelativeTime";
import { countryFromCode } from "@/lib/countries";
import { useForum } from "@/lib/forum-store";
import type { Post } from "@/lib/types";

function PostImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="max-h-96 w-full rounded-xl border border-zinc-800 object-cover"
    />
  );
}

interface PostCardProps {
  post: Post;
  /** 詳細頁：完整內文並預設展開留言 */
  detail?: boolean;
}

export default function PostCard({ post, detail = false }: PostCardProps) {
  const { getProfileById, comments, isLiked, isShared, toggleLike, toggleShare } = useForum();
  const [open, setOpen] = useState(detail);
  const [copied, setCopied] = useState(false);

  const author = getProfileById(post.author_id);
  if (!author) return null;

  const country = countryFromCode(post.ip_country_code);
  const liked = isLiked(post.id);
  const shared = isShared(post.id);
  const featured = open ? null : pickFeatured(comments.filter((c) => c.post_id === post.id));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 剪貼簿不可用時忽略
    }
  };

  const paragraphs = post.content.split(/\n{2,}/);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-700 sm:p-6">
      {/* 作者資訊 + 評分 */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/user/${author.username}`} className="shrink-0">
            <Avatar name={author.display_name} src={author.avatar_url} className="h-11 w-11" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <Link href={`/user/${author.username}`} className="font-semibold text-zinc-100 hover:underline">
                {author.display_name}
              </Link>
              <span className="text-zinc-500">@{author.username}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
              <RelativeTime iso={post.created_at} />
              <span aria-hidden="true">·</span>
              <span title="發文時的 IP 所在地">
                IP 所在地：{country.flag} {country.name}
              </span>
            </div>
            <AuthorRating profile={author} className="mt-1" />
          </div>
        </div>
        <RatingBadge score={post.ai_rating} label="本篇 AI 邏輯" />
      </header>

      {/* 內文 */}
      <div className="mt-4 space-y-3">
        <span className="inline-block rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-xs text-zinc-300">
          {post.category}
        </span>
        <h2 className="text-lg font-semibold leading-snug text-zinc-50 sm:text-xl">
          {detail ? (
            post.title
          ) : (
            <Link href={`/post/${post.id}`} className="hover:text-indigo-300">
              {post.title}
            </Link>
          )}
        </h2>
        <div className={`space-y-2 text-sm leading-relaxed text-zinc-300 ${detail ? "" : "line-clamp-4"}`}>
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line break-words">
              {p}
            </p>
          ))}
        </div>
        {post.image_url && <PostImage src={post.image_url} alt={`${post.title} 的配圖`} />}
      </div>

      {/* AI 摘要 */}
      <div className="mt-4">
        <AiSummary text={post.ai_summary} source={post.ai_source} label="AI 邏輯短評" />
      </div>

      {/* 互動列 */}
      <div className="mt-4 flex items-center gap-1 border-t border-zinc-800 pt-3 text-sm text-zinc-400">
        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          aria-pressed={liked}
          aria-label={`按讚，目前 ${post.likes_count} 個`}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-zinc-800 ${
            liked ? "text-rose-400" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} aria-hidden="true" />
          <span className="tabular-nums">{post.likes_count}</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`留言，目前 ${post.comments_count} 則`}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-zinc-800 ${
            open ? "text-indigo-300" : ""
          }`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span className="tabular-nums">{post.comments_count}</span>
        </button>
        <button
          type="button"
          onClick={() => toggleShare(post.id)}
          aria-pressed={shared}
          aria-label={`轉發，目前 ${post.shares_count} 次`}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-zinc-800 ${
            shared ? "text-emerald-400" : ""
          }`}
        >
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          <span className="tabular-nums">{post.shares_count}</span>
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-zinc-800"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
          <span className="text-xs">{copied ? "已複製連結" : "分享連結"}</span>
        </button>
      </div>

      {/* 精選留言預覽 / 完整留言區 */}
      {featured && (
        <div className="mt-3">
          <ul>
            <CommentItem comment={featured} featured />
          </ul>
          {post.comments_count > 1 && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-2 text-xs text-indigo-300 hover:underline"
            >
              查看全部 {post.comments_count} 則留言
            </button>
          )}
        </div>
      )}
      {open && (
        <div className="mt-4">
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  );
}
