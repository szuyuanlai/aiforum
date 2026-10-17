"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Info, SearchX, Trophy } from "lucide-react";
import AuthorRating from "@/components/AuthorRating";
import Avatar from "@/components/Avatar";
import CategoryNav from "@/components/CategoryNav";
import PostCard from "@/components/PostCard";
import PostComposer from "@/components/PostComposer";
import { countryFromCode } from "@/lib/countries";
import { useForum } from "@/lib/forum-store";

export default function HomeFeed() {
  const { posts, profiles, category, query, setQuery, setCategory } = useForum();

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => {
        if (category !== "全部" && p.category !== category) return false;
        if (!q) return true;
        const author = profiles.find((a) => a.id === p.author_id);
        const country = countryFromCode(p.ip_country_code);
        const haystack = [
          p.title,
          p.content,
          p.category,
          p.ai_summary,
          author?.username,
          author?.display_name,
          country.name,
          p.ip_country_code,
        ]
          .filter(Boolean)
          .join("\n")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [posts, profiles, category, query]);

  const topAuthors = useMemo(
    () =>
      profiles
        .filter((p) => p.post_count > 0)
        .sort((a, b) => b.avg_ai_rating - a.avg_ai_rating)
        .slice(0, 4),
    [profiles],
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <main className="min-w-0 space-y-5">
        <CategoryNav />
        <PostComposer />

        {query.trim() && (
          <p className="text-sm text-zinc-400">
            搜尋「<span className="text-zinc-100">{query.trim()}</span>」找到 {visiblePosts.length} 篇討論
          </p>
        )}

        {visiblePosts.length > 0 ? (
          <div className="space-y-5">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">
            <SearchX className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">找不到符合的討論。</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("全部");
              }}
              className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              清除搜尋與分類
            </button>
          </div>
        )}
      </main>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Trophy className="h-4 w-4 text-amber-400" aria-hidden="true" />
            邏輯評分榜
          </h2>
          <ol className="mt-4 space-y-4">
            {topAuthors.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className="w-4 text-center text-xs text-zinc-500">{i + 1}</span>
                <Link href={`/user/${a.username}`} className="shrink-0">
                  <Avatar name={a.display_name} src={a.avatar_url} className="h-9 w-9" />
                </Link>
                <div className="min-w-0">
                  <Link href={`/user/${a.username}`} className="block truncate text-sm font-medium text-zinc-100 hover:underline">
                    {a.display_name}
                  </Link>
                  <AuthorRating profile={a} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm leading-relaxed text-zinc-400">
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-zinc-100">
            <Info className="h-4 w-4 text-indigo-400" aria-hidden="true" />
            AI 邏輯評分如何運作？
          </h2>
          <p>
            每篇文章與留言送出後，AI 會依「前提是否清楚、推論是否成立、有無證據、是否出現邏輯謬誤」給出 1–5
            星評分與短評。評分只評估論證的品質，與立場無關。
          </p>
        </section>
      </aside>
    </div>
  );
}
