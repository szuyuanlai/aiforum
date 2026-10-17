import { clampScore } from "@/lib/countries";
import type { LogicEvaluation } from "@/lib/types";

/**
 * 本地規則引擎：在沒有設定 OPENAI_API_KEY（或 LLM 呼叫失敗）時使用。
 * 以「論證結構、證據、語氣與謬誤徵兆」估算 1–5 星邏輯評分並產生短評。
 * 純函式，伺服器與瀏覽器皆可呼叫。
 */

const REASONING_WORDS = ["因為", "由於", "所以", "因此", "故", "可見", "換言之", "推論", "結論", "前提", "假設"];
const CONTRAST_WORDS = ["但是", "然而", "不過", "相對", "另一方面", "反之", "雖然", "儘管", "權衡"];
const EVIDENCE_WORDS = ["研究", "數據", "統計", "調查", "報告", "實驗", "例如", "舉例", "案例", "根據", "%", "％"];
const ABSOLUTE_WORDS = ["一定", "絕對", "肯定", "永遠", "從來", "完全", "必然", "毫無疑問", "所有人", "每個人", "大家都"];
const FALLACY_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /大家都|所有人都|每個人都|很多人都/, label: "訴諸群眾" },
  { re: /不然就是|只有.{0,6}才|非黑即白/, label: "非黑即白" },
  { re: /他.{0,4}(人品|智商|背景)|你懂什麼|這種人/, label: "人身攻擊" },
  { re: /一旦.{0,12}就會(完蛋|毀滅|崩潰)|必然導致/, label: "滑坡論證" },
];

function countHits(text: string, words: string[]): number {
  return words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
}

export function heuristicEvaluate(text: string, title = ""): LogicEvaluation {
  const body = `${title}\n${text}`.trim();
  const length = [...text.replace(/\s+/g, "")].length;

  const reasoning = countHits(body, REASONING_WORDS);
  const contrast = countHits(body, CONTRAST_WORDS);
  const evidence = countHits(body, EVIDENCE_WORDS);
  const absolutes = countHits(body, ABSOLUTE_WORDS);
  const fallacies = FALLACY_PATTERNS.filter((f) => f.re.test(body));
  const shouting = (body.match(/[!！]{2,}|[?？]{3,}/g) ?? []).length;
  const sentences = text.split(/[。！？!?\n]/).filter((s) => s.trim().length > 3).length;

  let score = 1.8;
  score += Math.min(length / 150, 1) * 0.7; // 論述充分度
  score += Math.min(reasoning, 3) * 0.3; // 推論連接
  score += Math.min(contrast, 2) * 0.3; // 正反權衡
  score += Math.min(evidence, 3) * 0.25; // 證據
  score += Math.min(sentences, 4) * 0.05; // 結構
  score -= Math.min(absolutes, 3) * 0.25;
  score -= fallacies.length * 0.5;
  score -= shouting * 0.3;
  if (length < 15) score -= 0.6;

  const finalScore = clampScore(score);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (reasoning >= 2) strengths.push("前提與結論之間有明確推論");
  if (contrast >= 1) strengths.push("兼顧正反觀點並加以權衡");
  if (evidence >= 1) strengths.push("引用了證據或實例");
  if (length >= 80 && strengths.length === 0) strengths.push("論述篇幅充足");

  if (fallacies.length > 0) weaknesses.push(`出現「${fallacies[0].label}」的謬誤徵兆`);
  if (absolutes >= 2) weaknesses.push("使用過多絕對化用語");
  if (evidence === 0) weaknesses.push("缺少具體證據支撐");
  if (reasoning === 0) weaknesses.push("推論過程不夠清楚");
  if (length < 15) weaknesses.push("內容過短，難以判斷論證");
  if (shouting > 0) weaknesses.push("情緒化標點影響論述客觀性");

  let comment: string;
  if (finalScore >= 4) {
    comment = `論點結構完整：${strengths.slice(0, 2).join("，") || "論述清楚"}${
      weaknesses[0] ? `；可再改進：${weaknesses[0]}` : "，整體推論一致"
    }。`;
  } else if (finalScore >= 3) {
    comment = `論述尚可：${strengths[0] || "有基本立場"}，但${weaknesses.slice(0, 2).join("、") || "仍可補充更多論據"}。`;
  } else {
    comment = `邏輯有待加強：${weaknesses.slice(0, 2).join("、") || "論證不夠完整"}，建議補充前提與證據。`;
  }

  return { score: finalScore, comment, source: "fallback" };
}
