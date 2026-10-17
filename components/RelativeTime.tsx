"use client";

import { useEffect, useState } from "react";
import { timeLabel } from "@/lib/countries";

function absolute(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** 首次渲染顯示固定日期（避免 SSR/CSR 不一致），掛載後改為「x 分鐘前」。 */
export default function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [label, setLabel] = useState(() => absolute(iso));

  useEffect(() => {
    const update = () => setLabel(timeLabel(iso));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [iso]);

  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} className={className}>
      {label}
    </time>
  );
}
