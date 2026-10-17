/**
 * 與 Supabase 資料表欄位對應的 TypeScript 型別（snake_case）。
 */

/** AI 邏輯評分：1 ~ 5 星 */
export type AiRating = 1 | 2 | 3 | 4 | 5;

export const CATEGORIES = ["全部", "日常", "感情", "美食", "籃球", "政治", "汽車"] as const;
export type Category = (typeof CATEGORIES)[number];
export type PostCategory = Exclude<Category, "全部">;

/** profiles 資料表 */
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country_code: string | null;
  created_at: string; // ISO 8601
}

/** posts 資料表 */
export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category?: PostCategory | null;
  ai_rating: AiRating;
  ai_summary: string;
  created_at: string; // ISO 8601
  updated_at?: string | null;
  /** 透過 join 取得的作者資料 */
  author?: Profile;
}

/** comments 資料表 */
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  ai_rating: AiRating | null;
  ai_summary: string | null;
  created_at: string; // ISO 8601
  /** 透過 join 取得的作者資料 */
  author?: Profile;
}

/** 新增文章時送出的欄位（AI 評分由後端產生） */
export type NewPostInput = Pick<Post, "title" | "content">;
