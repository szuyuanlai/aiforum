"use client";

import { CATEGORIES } from "@/lib/types";
import { useForum } from "@/lib/forum-store";

export default function CategoryNav() {
  const { category, setCategory } = useForum();

  return (
    <nav aria-label="文章分類" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 pb-1">
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={active}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {c}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
