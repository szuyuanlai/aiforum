"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LogOut, Search, User as UserIcon, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useForum } from "@/lib/forum-store";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.39-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
    </svg>
  );
}

export default function Header() {
  const { query, setQuery, currentUser, login, logout, demoMode } = useForum();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const goHome = () => {
    if (pathname !== "/") router.push("/");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    goHome();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          onClick={() => setQuery("")}
          className="font-brand bg-gradient-to-r from-zinc-50 via-indigo-200 to-violet-300 bg-clip-text text-2xl font-semibold tracking-wide text-transparent"
        >
          szyuanlai
        </Link>

        <form
          role="search"
          onSubmit={onSubmit}
          className="order-3 w-full sm:order-none sm:w-auto sm:flex-1 sm:max-w-xl"
        >
          <label htmlFor="global-search" className="sr-only">
            搜尋討論主題、關鍵字或國家
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <input
              id="global-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                goHome();
              }}
              placeholder="搜尋討論主題、關鍵字或國家…"
              className="w-full rounded-full border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="清除搜尋"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-500 hover:text-zinc-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </form>

        <div className="ml-auto flex items-center gap-3">
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 py-1 pl-1 pr-3 text-sm text-zinc-200 hover:border-zinc-700"
              >
                <Avatar name={currentUser.display_name} src={currentUser.avatar_url} className="h-7 w-7" textClassName="text-xs" />
                <span className="hidden max-w-[8rem] truncate sm:inline">{currentUser.display_name}</span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl"
                >
                  <Link
                    role="menuitem"
                    href={`/user/${currentUser.username}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <UserIcon className="h-4 w-4" aria-hidden="true" />
                    個人檔案
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void logout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void login()}
              title={demoMode ? "尚未設定 Supabase，將以示範帳號登入" : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              <GoogleIcon />
              使用 Google 登入
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
