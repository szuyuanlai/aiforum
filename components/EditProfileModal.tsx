"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useForum } from "@/lib/forum-store";
import { fileToResizedDataUrl } from "@/lib/image";
import { BIO_MAX_LENGTH, DISPLAY_NAME_MAX_LENGTH, type Profile } from "@/lib/types";

const clip = (value: string, max: number) => [...value].slice(0, max).join("");

export default function EditProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const { updateProfile } = useForum();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState<string | null>(profile.avatar_url);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const onPickAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = await fileToResizedDataUrl(file, 256, true);
    if (result.ok) {
      setAvatar(result.dataUrl);
      setError(null);
    } else {
      setError(result.error);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = updateProfile({ display_name: displayName, bio: bio.trim(), avatar_url: avatar });
    if (result.ok) onClose();
    else setError(result.error);
  };

  const bioLength = [...bio].length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="edit-profile-title" className="text-lg font-semibold text-zinc-50">
            編輯個人資料
          </h2>
          <button type="button" onClick={onClose} aria-label="關閉" className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={displayName || profile.username} src={avatar} className="h-20 w-20" textClassName="text-2xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="更換頭貼"
              className="absolute -bottom-1 -right-1 rounded-full bg-indigo-600 p-2 text-white ring-2 ring-zinc-900 hover:bg-indigo-500"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={onPickAvatar} />
          </div>
          <div className="text-xs text-zinc-500">
            <p>支援 JPG / PNG，大小上限 5MB。</p>
            {avatar && (
              <button type="button" onClick={() => setAvatar(null)} className="mt-1 text-zinc-400 underline hover:text-zinc-200">
                移除頭貼
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-display-name" className="text-sm font-medium text-zinc-300">
            顯示名稱
          </label>
          <input
            id="edit-display-name"
            ref={nameRef}
            value={displayName}
            onChange={(e) => setDisplayName(clip(e.target.value, DISPLAY_NAME_MAX_LENGTH))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="edit-bio" className="text-sm font-medium text-zinc-300">
              個人簡介
            </label>
            <span className={`text-xs tabular-nums ${bioLength >= BIO_MAX_LENGTH ? "text-amber-400" : "text-zinc-500"}`}>
              {bioLength} / {BIO_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="edit-bio"
            value={bio}
            rows={4}
            onChange={(e) => setBio(clip(e.target.value, BIO_MAX_LENGTH))}
            placeholder="介紹一下你自己…"
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            取消
          </button>
          <button type="submit" className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            儲存
          </button>
        </div>
      </form>
    </div>
  );
}
