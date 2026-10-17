"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, Heart, MessageCircle, Pencil, ScrollText, Star } from "lucide-react";
import Avatar from "@/components/Avatar";
import { CommentItem } from "@/components/CommentSection";
import EditProfileModal from "@/components/EditProfileModal";
import PostCard from "@/components/PostCard";
import { countryFromCode, joinedLabel } from "@/lib/countries";
import { useForum } from "@/lib/forum-store";
import type { Post } from "@/lib/types";

type Tab = "posts" | "replies" | "shares";

const TABS: { id: Tab; label: string }[] = [
  { id: "posts", label: "貼文" },
  { id: "replies", label: "回覆" },
  { id: "shares", label: "轉發" },
];

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">{icon}</div>
      <div className="text-xl font-semibold tabular-nums text-zinc-50">{value.toLocaleString("en-US")}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

export default function ProfileView({ username }: { username: string }) {
  const { getProfileByUsername, posts, comments, shares, currentUser } = useForum();
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const closeEditor = useCallback(() => setEditing(false), []);

  const profile = getProfileByUsername(username);

  const userPosts = useMemo(
    () =>
      profile
        ? posts.filter((p) => p.author_id === profile.id).sort((a, b) => b.created_at.localeCompare(a.created_at))
        : [],
    [posts, profile],
  );
  const userReplies = useMemo(
    () =>
      profile
        ? comments
            .filter((c) => c.author_id === profile.id)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
        : [],
    [comments, profile],
  );
  const sharedPosts = useMemo(() => {
    if (!profile) return [];
    return shares
      .filter((s) => s.user_id === profile.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((s) => posts.find((p) => p.id === s.post_id))
      .filter((p): p is Post => Boolean(p));
  }, [shares, posts, profile]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-zinc-400">
        <p className="text-lg">找不到使用者 @{username}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-indigo-300 hover:underline">
          回到首頁
        </Link>
      </div>
    );
  }

  const country = countryFromCode(profile.country_code);
  const isOwn = currentUser?.id === profile.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="h-28 bg-gradient-to-r from-indigo-900/70 via-violet-900/50 to-slate-900 sm:h-36" aria-hidden="true" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-14">
            <div className="rounded-full ring-4 ring-zinc-900">
              <Avatar
                name={profile.display_name}
                src={profile.avatar_url}
                className="h-24 w-24 sm:h-28 sm:w-28"
                textClassName="text-4xl"
              />
            </div>
            {isOwn && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                編輯個人資料
              </button>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-zinc-50">{profile.display_name}</h1>
          <p className="text-sm text-zinc-500">
            @{profile.username} · {country.flag} {country.name}
          </p>
          <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-zinc-300">
            {profile.bio || (isOwn ? "你還沒有填寫個人簡介。" : "這位使用者還沒有填寫個人簡介。")}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {joinedLabel(profile.created_at)}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" aria-hidden="true" />
            <div>
              <div className="text-xs text-amber-200/80">歷史平均 AI 邏輯評分</div>
              <div className="text-lg font-semibold text-amber-300 tabular-nums">
                {profile.post_count > 0 ? profile.avg_ai_rating.toFixed(1) : "—"}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  / 5 · 總發文數：{profile.post_count} 篇
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat icon={<ScrollText className="h-4 w-4" aria-hidden="true" />} label="貼文數" value={profile.post_count} />
            <Stat icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />} label="回覆數" value={profile.reply_count} />
            <Stat icon={<Heart className="h-4 w-4" aria-hidden="true" />} label="獲得讚數" value={profile.likes_received} />
          </div>
        </div>
      </section>

      <div role="tablist" aria-label="個人內容" className="mt-6 flex border-b border-zinc-800">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls="profile-tabpanel"
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px flex-1 border-b-2 px-4 py-3 text-sm font-medium transition ${
                active ? "border-indigo-500 text-zinc-50" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="profile-tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5 space-y-5">
        {tab === "posts" &&
          (userPosts.length > 0 ? userPosts.map((p) => <PostCard key={p.id} post={p} />) : <Empty text="還沒有發表任何貼文。" />)}

        {tab === "replies" &&
          (userReplies.length > 0 ? (
            userReplies.map((c) => {
              const post = posts.find((p) => p.id === c.post_id);
              return (
                <div key={c.id} className="space-y-2">
                  {post && (
                    <p className="text-xs text-zinc-500">
                      回覆於{" "}
                      <Link href={`/post/${post.id}`} className="text-indigo-300 hover:underline">
                        {post.title}
                      </Link>
                    </p>
                  )}
                  <ul>
                    <CommentItem comment={c} />
                  </ul>
                </div>
              );
            })
          ) : (
            <Empty text="還沒有任何回覆。" />
          ))}

        {tab === "shares" &&
          (sharedPosts.length > 0 ? sharedPosts.map((p) => <PostCard key={p.id} post={p} />) : <Empty text="還沒有轉發任何貼文。" />)}
      </div>

      {editing && isOwn && <EditProfileModal profile={profile} onClose={closeEditor} />}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{text}</p>;
}
