"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForum } from "@/lib/forum-store";

/** /profile：導向目前登入者的個人專頁；未登入則提示登入。 */
export default function MyProfilePage() {
  const { ready, currentUser, login } = useForum();
  const router = useRouter();

  useEffect(() => {
    if (ready && currentUser) router.replace(`/user/${currentUser.username}`);
  }, [ready, currentUser, router]);

  if (currentUser) return <p className="py-24 text-center text-zinc-500">前往你的個人專頁…</p>;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-zinc-300">請先登入以查看你的個人檔案。</p>
      <button
        type="button"
        onClick={() => void login()}
        className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        使用 Google 登入
      </button>
    </div>
  );
}
