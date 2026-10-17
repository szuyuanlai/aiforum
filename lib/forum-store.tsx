"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { SEED_COMMENTS, SEED_LIKES, SEED_POSTS, SEED_PROFILES, SEED_SHARES } from "@/lib/mock-data";
import { heuristicEvaluate } from "@/lib/logic-heuristic";
import { getSupabase } from "@/lib/supabase";
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  type Category,
  type Comment,
  type LogicEvaluation,
  type Post,
  type PostCategory,
  type PostLike,
  type PostShare,
  type Profile,
  type ProfileUpdate,
} from "@/lib/types";

/**
 * 論壇的前端資料層。
 * - 未設定 Supabase 環境變數：以範例資料 + localStorage 運作（示範模式）。
 * - 已設定：Google 登入走 Supabase Auth；貼文/留言資料仍存在本機，
 *   之後可將下方 actions 換成對 supabase 資料表的讀寫（欄位已與 supabase/schema.sql 對應）。
 */

const STORAGE_KEY = "szyuanlai-forum-v1";

interface ForumData {
  profiles: Profile[];
  posts: Post[];
  comments: Comment[];
  likes: PostLike[];
  shares: PostShare[];
  currentUserId: string | null;
}

const INITIAL_DATA: ForumData = {
  profiles: SEED_PROFILES,
  posts: SEED_POSTS,
  comments: SEED_COMMENTS,
  likes: SEED_LIKES,
  shares: SEED_SHARES,
  currentUserId: null,
};

export type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

interface ForumContextValue {
  ready: boolean;
  demoMode: boolean;
  profiles: Profile[];
  posts: Post[];
  comments: Comment[];
  shares: PostShare[];
  currentUser: Profile | null;
  query: string;
  category: Category;
  setQuery: (q: string) => void;
  setCategory: (c: Category) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  /** 若尚未登入會觸發登入流程並回傳 false */
  requireLogin: () => boolean;
  getProfileById: (id: string) => Profile | undefined;
  getProfileByUsername: (username: string) => Profile | undefined;
  isLiked: (postId: string) => boolean;
  isShared: (postId: string) => boolean;
  createPost: (input: {
    title: string;
    content: string;
    category: PostCategory;
    image_url: string | null;
  }) => Promise<Result<Post>>;
  addComment: (postId: string, content: string) => Promise<Result<Comment>>;
  toggleLike: (postId: string) => void;
  toggleShare: (postId: string) => void;
  updateProfile: (update: ProfileUpdate) => Result;
}

const ForumContext = createContext<ForumContextValue | null>(null);

function makeId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function evaluate(
  kind: "post" | "comment",
  text: string,
  title = "",
): Promise<LogicEvaluation> {
  try {
    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, text, title }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as LogicEvaluation;
  } catch {
    // API 不可用時改用本地規則引擎，確保發文流程不中斷
    return heuristicEvaluate(text, title);
  }
}

function usernameFromUser(user: User, taken: Set<string>): string {
  const base =
    (user.email?.split("@")[0] ?? "user").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20) || "user";
  let name = base;
  let i = 1;
  while (taken.has(name)) name = `${base}_${i++}`;
  return name;
}

export function ForumProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ForumData>(INITIAL_DATA);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("全部");
  const dataRef = useRef(data);
  dataRef.current = data;

  const supabase = useMemo(() => getSupabase(), []);
  const demoMode = supabase === null;

  // 載入本機資料 + Supabase session
  useEffect(() => {
    let cancelled = false;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<ForumData>;
        setData((prev) => ({
          profiles: stored.profiles ?? prev.profiles,
          posts: stored.posts ?? prev.posts,
          comments: stored.comments ?? prev.comments,
          likes: stored.likes ?? prev.likes,
          shares: stored.shares ?? prev.shares,
          currentUserId: supabase ? null : (stored.currentUserId ?? null),
        }));
      }
    } catch {
      // 資料損毀時忽略，沿用範例資料
    }

    const adoptUser = (user: User | null) => {
      if (cancelled) return;
      if (!user) {
        setData((prev) => ({ ...prev, currentUserId: null }));
        return;
      }
      setData((prev) => {
        if (prev.profiles.some((p) => p.id === user.id)) return { ...prev, currentUserId: user.id };
        const meta = user.user_metadata as Record<string, string | undefined>;
        const profile: Profile = {
          id: user.id,
          username: usernameFromUser(user, new Set(prev.profiles.map((p) => p.username))),
          display_name: (meta.full_name ?? meta.name ?? "新使用者").slice(0, DISPLAY_NAME_MAX_LENGTH),
          avatar_url: meta.avatar_url ?? meta.picture ?? null,
          bio: "",
          country_code: "TW",
          created_at: new Date().toISOString(),
          avg_ai_rating: 0,
          post_count: 0,
          reply_count: 0,
          likes_received: 0,
        };
        return { ...prev, profiles: [...prev.profiles, profile], currentUserId: user.id };
      });
    };

    let unsubscribe: (() => void) | undefined;
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => adoptUser(session?.user ?? null));
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => adoptUser(session?.user ?? null));
      unsubscribe = () => sub.subscription.unsubscribe();
    }

    setReady(true);
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [supabase]);

  // 寫回 localStorage
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(supabase ? { ...data, currentUserId: null } : data),
      );
    } catch {
      // 容量不足（例如大量圖片）時略過持久化
    }
  }, [data, ready, supabase]);

  const currentUser = useMemo(
    () => data.profiles.find((p) => p.id === data.currentUserId) ?? null,
    [data.profiles, data.currentUserId],
  );

  const login = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      return;
    }
    // 示範模式：以本機示範帳號模擬 Google 登入
    setData((prev) => {
      const existing = prev.profiles.find((p) => p.id === "u-demo");
      if (existing) return { ...prev, currentUserId: existing.id };
      const demo: Profile = {
        id: "u-demo",
        username: "guest_demo",
        display_name: "示範使用者",
        avatar_url: null,
        bio: "",
        country_code: "TW",
        created_at: new Date().toISOString(),
        avg_ai_rating: 0,
        post_count: 0,
        reply_count: 0,
        likes_received: 0,
      };
      return { ...prev, profiles: [...prev.profiles, demo], currentUserId: demo.id };
    });
  }, [supabase]);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setData((prev) => ({ ...prev, currentUserId: null }));
  }, [supabase]);

  const requireLogin = useCallback(() => {
    if (dataRef.current.currentUserId) return true;
    void login();
    return false;
  }, [login]);

  const getProfileById = useCallback(
    (id: string) => data.profiles.find((p) => p.id === id),
    [data.profiles],
  );
  const getProfileByUsername = useCallback(
    (username: string) => data.profiles.find((p) => p.username.toLowerCase() === username.toLowerCase()),
    [data.profiles],
  );

  const isLiked = useCallback(
    (postId: string) => data.likes.some((l) => l.post_id === postId && l.user_id === data.currentUserId),
    [data.likes, data.currentUserId],
  );
  const isShared = useCallback(
    (postId: string) => data.shares.some((s) => s.post_id === postId && s.user_id === data.currentUserId),
    [data.shares, data.currentUserId],
  );

  const createPost = useCallback<ForumContextValue["createPost"]>(async (input) => {
    const userId = dataRef.current.currentUserId;
    if (!userId) return { ok: false, error: "請先登入" };
    const title = input.title.trim();
    const content = input.content.trim();
    if (!title || !content) return { ok: false, error: "標題與內文皆為必填" };

    const evaluation = await evaluate("post", content, title);
    const author = dataRef.current.profiles.find((p) => p.id === userId);
    const post: Post = {
      id: makeId("p"),
      author_id: userId,
      category: input.category,
      title,
      content,
      image_url: input.image_url,
      ai_rating: evaluation.score,
      ai_summary: evaluation.comment,
      ai_source: evaluation.source,
      ip_country_code: evaluation.country_code ?? author?.country_code ?? "TW",
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      posts: [post, ...prev.posts],
      profiles: prev.profiles.map((p) =>
        p.id === userId
          ? {
              ...p,
              avg_ai_rating: round2((p.avg_ai_rating * p.post_count + post.ai_rating) / (p.post_count + 1)),
              post_count: p.post_count + 1,
            }
          : p,
      ),
    }));
    return { ok: true, data: post };
  }, []);

  const addComment = useCallback<ForumContextValue["addComment"]>(async (postId, rawContent) => {
    const userId = dataRef.current.currentUserId;
    if (!userId) return { ok: false, error: "請先登入" };
    const content = rawContent.trim();
    if (!content) return { ok: false, error: "留言不可為空" };

    const evaluation = await evaluate("comment", content);
    const comment: Comment = {
      id: makeId("c"),
      post_id: postId,
      author_id: userId,
      parent_id: null,
      content,
      ai_rating: evaluation.score,
      ai_summary: evaluation.comment,
      ai_source: evaluation.source,
      created_at: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
      posts: prev.posts.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p)),
      profiles: prev.profiles.map((p) => (p.id === userId ? { ...p, reply_count: p.reply_count + 1 } : p)),
    }));
    return { ok: true, data: comment };
  }, []);

  const toggleLike = useCallback((postId: string) => {
    const userId = dataRef.current.currentUserId;
    if (!userId) {
      void login();
      return;
    }
    setData((prev) => {
      const post = prev.posts.find((p) => p.id === postId);
      if (!post) return prev;
      const already = prev.likes.some((l) => l.post_id === postId && l.user_id === userId);
      const delta = already ? -1 : 1;
      return {
        ...prev,
        likes: already
          ? prev.likes.filter((l) => !(l.post_id === postId && l.user_id === userId))
          : [...prev.likes, { user_id: userId, post_id: postId }],
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count + delta) } : p,
        ),
        profiles: prev.profiles.map((p) =>
          p.id === post.author_id ? { ...p, likes_received: Math.max(0, p.likes_received + delta) } : p,
        ),
      };
    });
  }, [login]);

  const toggleShare = useCallback((postId: string) => {
    const userId = dataRef.current.currentUserId;
    if (!userId) {
      void login();
      return;
    }
    setData((prev) => {
      const already = prev.shares.some((s) => s.post_id === postId && s.user_id === userId);
      const delta = already ? -1 : 1;
      return {
        ...prev,
        shares: already
          ? prev.shares.filter((s) => !(s.post_id === postId && s.user_id === userId))
          : [...prev.shares, { user_id: userId, post_id: postId, created_at: new Date().toISOString() }],
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, shares_count: Math.max(0, p.shares_count + delta) } : p,
        ),
      };
    });
  }, [login]);

  const updateProfile = useCallback<ForumContextValue["updateProfile"]>((update) => {
    const userId = dataRef.current.currentUserId;
    if (!userId) return { ok: false, error: "請先登入" };
    if (update.display_name !== undefined) {
      const name = update.display_name.trim();
      if (!name) return { ok: false, error: "顯示名稱不可為空" };
      if ([...name].length > DISPLAY_NAME_MAX_LENGTH) {
        return { ok: false, error: `顯示名稱最多 ${DISPLAY_NAME_MAX_LENGTH} 字` };
      }
      update = { ...update, display_name: name };
    }
    if (update.bio !== undefined && [...update.bio].length > BIO_MAX_LENGTH) {
      return { ok: false, error: `個人簡介最多 ${BIO_MAX_LENGTH} 字` };
    }
    setData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === userId ? { ...p, ...update } : p)),
    }));
    return { ok: true, data: null };
  }, []);

  const value = useMemo<ForumContextValue>(
    () => ({
      ready,
      demoMode,
      profiles: data.profiles,
      posts: data.posts,
      comments: data.comments,
      shares: data.shares,
      currentUser,
      query,
      category,
      setQuery,
      setCategory,
      login,
      logout,
      requireLogin,
      getProfileById,
      getProfileByUsername,
      isLiked,
      isShared,
      createPost,
      addComment,
      toggleLike,
      toggleShare,
      updateProfile,
    }),
    [
      ready,
      demoMode,
      data.profiles,
      data.posts,
      data.comments,
      data.shares,
      currentUser,
      query,
      category,
      login,
      logout,
      requireLogin,
      getProfileById,
      getProfileByUsername,
      isLiked,
      isShared,
      createPost,
      addComment,
      toggleLike,
      toggleShare,
      updateProfile,
    ],
  );

  return <ForumContext.Provider value={value}>{children}</ForumContext.Provider>;
}

export function useForum(): ForumContextValue {
  const ctx = useContext(ForumContext);
  if (!ctx) throw new Error("useForum 必須在 <ForumProvider> 內使用");
  return ctx;
}
