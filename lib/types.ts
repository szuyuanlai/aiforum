/**
 * 與 Supabase 資料表欄位對應的 TypeScript 型別（snake_case）。
 * 對應的 SQL 請見 supabase/schema.sql。
 */

export const CATEGORIES = ["全部", "日常", "感情", "美食", "籃球", "政治", "汽車"] as const;
export type Category = (typeof CATEGORIES)[number];
export type PostCategory = Exclude<Category, "全部">;
export const POST_CATEGORIES = CATEGORIES.filter((c): c is PostCategory => c !== "全部");

/** AI 評分來源：openai = 由 LLM 評分；fallback = 本地規則引擎；seed = 範例資料 */
export type AiSource = "openai" | "fallback" | "seed";

/** profiles 資料表 */
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  country_code: string;
  created_at: string; // ISO 8601
  /** 歷史平均 AI 邏輯評分（1–5，無貼文時為 0） */
  avg_ai_rating: number;
  post_count: number;
  reply_count: number;
  likes_received: number;
}

/** posts 資料表 */
export interface Post {
  id: string;
  author_id: string;
  category: PostCategory;
  title: string;
  content: string;
  image_url: string | null;
  /** AI 邏輯評分（1.0–5.0） */
  ai_rating: number;
  ai_summary: string;
  ai_source: AiSource;
  /** 發文時的 IP 所在地（ISO 3166-1 alpha-2） */
  ip_country_code: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string; // ISO 8601
}

/** comments 資料表 */
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  ai_rating: number;
  ai_summary: string;
  ai_source: AiSource;
  created_at: string; // ISO 8601
}

/** post_likes 資料表 */
export interface PostLike {
  user_id: string;
  post_id: string;
}

/** post_shares 資料表（轉發） */
export interface PostShare {
  user_id: string;
  post_id: string;
  created_at: string;
}

/** /api/evaluate 的回傳 */
export interface LogicEvaluation {
  score: number;
  comment: string;
  source: Exclude<AiSource, "seed">;
  /** 由請求標頭推得的 IP 所在地 */
  country_code?: string;
}

/** 更新個人檔案可編輯的欄位 */
export type ProfileUpdate = Partial<Pick<Profile, "display_name" | "bio" | "avatar_url">>;

export const BIO_MAX_LENGTH = 150;
export const DISPLAY_NAME_MAX_LENGTH = 20;
