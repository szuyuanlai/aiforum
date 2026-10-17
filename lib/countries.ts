export const COUNTRIES: Record<string, { flag: string; name: string }> = {
  TW: { flag: "🇹🇼", name: "台灣" },
  CA: { flag: "🇨🇦", name: "加拿大" },
  US: { flag: "🇺🇸", name: "美國" },
  JP: { flag: "🇯🇵", name: "日本" },
  DE: { flag: "🇩🇪", name: "德國" },
  KR: { flag: "🇰🇷", name: "韓國" },
  GB: { flag: "🇬🇧", name: "英國" },
  FR: { flag: "🇫🇷", name: "法國" },
  AU: { flag: "🇦🇺", name: "澳洲" },
  SG: { flag: "🇸🇬", name: "新加坡" },
};

export function countryFromCode(code: string | null | undefined) {
  const key = (code ?? "TW").toUpperCase();
  return COUNTRIES[key] ?? { flag: "🌐", name: key || "未知" };
}

export function timeLabel(iso: string, now = Date.now()) {
  const diff = now - new Date(iso).getTime();
  const min = Math.max(0, Math.floor(diff / 60000));
  if (min < 1) return "剛剛";
  if (min < 60) return `${min} 分鐘前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小時前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString("zh-TW");
}

export function joinedLabel(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月加入`;
}

export function makeExcerpt(content: string) {
  const flat = content.replace(/\s+/g, " ").trim();
  const chars = [...flat];
  if (chars.length <= 90) return flat;
  return `${chars.slice(0, 90).join("")}…`;
}

export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 3;
  const clamped = Math.min(5, Math.max(1, value));
  return Math.round(clamped * 10) / 10;
}

export function clampComment(value: string) {
  return [...value.replace(/\s+/g, " ").trim()].slice(0, 30).join("");
}
