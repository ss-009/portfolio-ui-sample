export type GainTone = "positive" | "negative" | "neutral";

// Intl の "currency" スタイルは実行環境の ICU データによって全角/半角の円記号が
// 揺れるため、桁区切りのみ Intl に任せ、記号は "¥" (半角) を明示的に付与する。
const numberFormatter = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });

export function formatYen(amount: number): string {
  return `¥${numberFormatter.format(amount)}`;
}

export function formatSignedYen(amount: number): string {
  const formatted = formatYen(Math.abs(amount));
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatSignedPercent(ratio: number, fractionDigits = 2): string {
  const formatted = Math.abs(ratio).toFixed(fractionDigits);
  if (ratio > 0) return `+${formatted}%`;
  if (ratio < 0) return `-${formatted}%`;
  return `${formatted}%`;
}

export function formatPercent(ratio: number, fractionDigits = 1): string {
  return `${ratio.toFixed(fractionDigits)}%`;
}

export function getGainTone(value: number): GainTone {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

export const GAIN_TONE_TEXT_CLASS: Record<GainTone, string> = {
  positive: "text-(--gain-positive)",
  negative: "text-(--gain-negative)",
  neutral: "text-(--gain-neutral)",
};

export const GAIN_TONE_BADGE_CLASS: Record<GainTone, string> = {
  positive: "border border-(--gain-positive)/25 bg-(--gain-positive)/10 text-(--gain-positive)",
  negative: "border border-(--gain-negative)/25 bg-(--gain-negative)/10 text-(--gain-negative)",
  neutral: "border border-(--gain-neutral)/25 bg-(--gain-neutral)/12 text-(--gain-neutral)",
};
