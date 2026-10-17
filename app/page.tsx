import { Brain, Star } from "lucide-react";
import NewPostForm from "@/components/NewPostForm";
import type { AiRating, Post } from "@/lib/types";

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author_id: "u1",
    title: "遠端工作是否真的提升整體生產力？",
    content:
      "多項研究顯示遠端工作減少通勤時間並提升專注度，但同時也降低了跨部門的自發性溝通。因此，混合制可能是兼顧兩者的最佳解。",
    ai_rating: 5,
    ai_summary: "論點結構完整：先陳述正反證據，再以權衡推導出混合制結論，前提與結論一致。",
    created_at: "2026-10-15T09:30:00Z",
  },
  {
    id: "2",
    author_id: "u2",
    title: "大家都在用 AI，所以 AI 一定是對的",
    content:
      "現在每個人都在用 AI 工具，使用人數這麼多，代表它給出的答案一定正確，我們不需要再驗證。",
    ai_rating: 2,
    ai_summary: "訴諸群眾謬誤：以使用人數推論正確性，缺乏對準確度的直接證據。",
    created_at: "2026-10-16T14:05:00Z",
  },
  {
    id: "3",
    author_id: "u3",
    title: "開源專案應該強制要求貢獻者簽署 CLA 嗎？",
    content:
      "CLA 能降低授權爭議風險，但可能提高新貢獻者的參與門檻。比較合理的做法是依專案規模與授權類型決定是否採用。",
    ai_rating: 4,
    ai_summary: "論述平衡，但缺少具體案例或數據支撐「門檻提高」的主張。",
    created_at: "2026-10-17T03:20:00Z",
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function RatingStars({ rating }: { rating: AiRating }) {
  return (
    <div className="flex items-center gap-1" aria-label={`AI 邏輯評分 ${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-600"
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs font-medium text-zinc-400">{rating}.0</span>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition hover:border-zinc-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-100">{post.title}</h3>
        <RatingStars rating={post.ai_rating} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">
        {post.content}
      </p>
      <div className="mt-4 flex gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3 text-sm text-indigo-200">
        <Brain className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-medium">AI 摘要：</span>
          {post.ai_summary}
        </p>
      </div>
      <p className="mt-3 text-xs text-zinc-500">{formatDate(post.created_at)}</p>
    </article>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-gradient-to-b from-slate-900 to-zinc-950">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-400" aria-hidden="true" />
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
              AI Logic Forum
            </h1>
          </div>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
            一個重視理性討論的論壇。每篇文章發布後，AI 會評估其邏輯品質，給出 1–5
            星評分與重點摘要，幫助大家寫出更紮實的論點。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-6 py-10">
        <section aria-labelledby="posts-heading">
          <h2 id="posts-heading" className="mb-4 text-xl font-semibold text-zinc-100">
            最新文章
          </h2>
          <div className="space-y-4">
            {MOCK_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <section aria-labelledby="new-post-heading">
          <h2 id="new-post-heading" className="mb-4 text-xl font-semibold text-zinc-100">
            發布新文章
          </h2>
          <NewPostForm />
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        © 2026 AI Logic Forum
      </footer>
    </div>
  );
}
