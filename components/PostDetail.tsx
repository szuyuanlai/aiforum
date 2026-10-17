"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useForum } from "@/lib/forum-store";

export default function PostDetail({ id }: { id: string }) {
  const { posts } = useForum();
  const post = posts.find((p) => p.id === id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        返回討論列表
      </Link>
      {post ? (
        <PostCard post={post} detail />
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center text-zinc-500">找不到這篇文章。</p>
      )}
    </div>
  );
}
