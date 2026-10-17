import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Logic Forum",
  description: "以 AI 評估邏輯品質的討論論壇：每篇文章都附帶 1–5 星邏輯評分與 AI 摘要。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-200 antialiased">
        {children}
      </body>
    </html>
  );
}
