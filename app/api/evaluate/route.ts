import { NextResponse } from "next/server";
import { clampScore } from "@/lib/countries";
import { heuristicEvaluate } from "@/lib/logic-heuristic";
import type { LogicEvaluation } from "@/lib/types";

export const runtime = "nodejs";

const MAX_TEXT = 5000;

type Kind = "post" | "comment";

function readCountry(req: Request): string | undefined {
  const code =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-country-code");
  return code && /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : undefined;
}

function buildPrompt(kind: Kind, title: string, text: string) {
  const target = kind === "post" ? "論壇貼文" : "論壇留言";
  return [
    {
      role: "system",
      content:
        `你是論壇的「邏輯品質評審」。請評估使用者的${target}之論證品質：` +
        "前提是否清楚、推論是否成立、是否有證據、是否有邏輯謬誤（如訴諸群眾、非黑即白、人身攻擊、滑坡）。" +
        "不要評論立場對錯，只評論邏輯品質。" +
        '請只輸出 JSON：{"score": 1.0 到 5.0 之間、小數一位的數字, "comment": "繁體中文短評，不超過 60 字"}。',
    },
    {
      role: "user",
      content: kind === "post" ? `標題：${title}\n內文：${text}` : `留言：${text}`,
    },
  ];
}

async function openAiEvaluate(kind: Kind, title: string, text: string): Promise<LogicEvaluation | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: buildPrompt(kind, title, text),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { score?: unknown; comment?: unknown };
    const score = Number(parsed.score);
    const comment = typeof parsed.comment === "string" ? parsed.comment.trim() : "";
    if (!Number.isFinite(score) || !comment) return null;

    return { score: clampScore(score), comment: comment.slice(0, 120), source: "openai" };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: { kind?: Kind; title?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "無效的請求內容" }, { status: 400 });
  }

  const kind: Kind = body.kind === "comment" ? "comment" : "post";
  const title = (body.title ?? "").toString().slice(0, 200);
  const text = (body.text ?? "").toString().trim().slice(0, MAX_TEXT);
  if (!text) {
    return NextResponse.json({ error: "內容不可為空" }, { status: 400 });
  }

  const result = (await openAiEvaluate(kind, title, text)) ?? heuristicEvaluate(text, title);
  return NextResponse.json({ ...result, country_code: readCountry(req) });
}
