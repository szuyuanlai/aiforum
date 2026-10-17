export const CATEGORIES = ["全部", "日常", "感情", "美食", "籃球", "政治", "汽車"] as const;

export type Category = (typeof CATEGORIES)[number];
export type PostCategory = Exclude<Category, "全部">;

export type LogicSource = "openai" | "fallback" | "preview";

export type Profile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  countryCode: string;
  countryName: string;
  flag: string;
  joinedAt: string;
  joinedLabel: string;
  avgLogicScore: number;
  speechCount: number;
};

export type Comment = {
  id: string;
  postId: string;
  parentId: string | null;
  author: Profile;
  content: string;
  createdAt: string;
  timeLabel: string;
  logicScore: number;
  logicComment: string;
  logicSource?: LogicSource;
  replies: Comment[];
};

export type Post = {
  id: string;
  author: Profile;
  category: PostCategory;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  timeLabel: string;
  logicScore: number;
  logicComment: string;
  logicSource?: LogicSource;
  ipFlag: string;
  ipCountry: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  sharedBy?: string[];
  commentThread?: Comment[];
  local?: boolean;
};

export type ProfileBundle = {
  profile: Profile;
  posts: Post[];
  replies: { post: Post; comment: Comment }[];
  shares: Post[];
};

export type LogicEvaluation = {
  score: number;
  comment: string;
  source: "openai" | "fallback";
};
