import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import { ForumProvider } from "@/lib/forum-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Logic Forum",
  description: "以 AI 評估邏輯品質的討論論壇：每篇文章與留言都附帶 1–5 星邏輯評分與 AI 短評。",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-200 antialiased">
        <ForumProvider>
          <Header />
          {children}
          <footer className="mt-12 border-t border-zinc-900 py-8 text-center text-xs text-zinc-600">
            © 2026 szyuanlai · AI Logic Forum
          </footer>
        </ForumProvider>
      </body>
    </html>
  );
}
