import type { Holding } from "@/types/portfolio";

export interface AngleRange {
  startAngle: number;
  endAngle: number;
}

export interface DonutSegment {
  ticker: string;
  holding: Holding;
  startAngle: number;
  endAngle: number;
  path: string;
}

export interface DonutGeometry {
  cx: number;
  cy: number;
  outerRadius: number;
  innerRadius: number;
  /** 隣接セグメント間の隙間（度）。既定は 0（隙間なし）。 */
  padAngle?: number;
}

/** 同率のときは Array.prototype.sort の安定ソートにより元の順序を保つ。 */
export function sortHoldingsByRatioDesc(holdings: Holding[]): Holding[] {
  return [...holdings].sort((a, b) => b.holdingRatio - a.holdingRatio);
}

export function computeAngleRanges(holdings: Holding[]): AngleRange[] {
  const total = holdings.reduce((sum, h) => sum + h.holdingRatio, 0);
  let cursor = 0;

  return holdings.map((holding) => {
    const sweep = total > 0 ? (holding.holdingRatio / total) * 360 : 0;
    const startAngle = cursor;
    const endAngle = cursor + sweep;
    cursor = endAngle;
    return { startAngle, endAngle };
  });
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  // angleDeg は 12時位置を 0 度とし、時計回りに増加する角度。
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.sin(angleRad),
    y: cy - radius * Math.cos(angleRad),
  };
}

export function describeDonutArc(
  geometry: DonutGeometry & { startAngle: number; endAngle: number },
): string {
  const { cx, cy, outerRadius, innerRadius, padAngle = 0 } = geometry;
  const sweep = geometry.endAngle - geometry.startAngle;

  // 隙間はセグメント幅を超えない範囲でしか適用しない（極端に小さい比率でも欠けを防ぐ）。
  const pad = Math.min(padAngle / 2, Math.max(sweep - 0.5, 0) / 2);
  const startAngle = geometry.startAngle + pad;
  const rawEndAngle = geometry.endAngle - pad;

  // 1銘柄100%のような完全な円になるケースは始点=終点となり path が描けないため、
  // わずかに欠けさせて円弧として成立させる。
  const endAngle = rawEndAngle - startAngle >= 359.99 ? startAngle + 359.99 : rawEndAngle;

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function buildDonutSegments(holdings: Holding[], geometry: DonutGeometry): DonutSegment[] {
  const sorted = sortHoldingsByRatioDesc(holdings);
  const ranges = computeAngleRanges(sorted);

  return sorted.map((holding, index) => {
    const { startAngle, endAngle } = ranges[index];
    return {
      ticker: holding.asset.tickerSymbol,
      holding,
      startAngle,
      endAngle,
      path: describeDonutArc({ ...geometry, startAngle, endAngle }),
    };
  });
}

const WHEEL_COLOR_COUNT = 8;

export function getWheelColorVar(index: number): string {
  const slot = (index % WHEEL_COLOR_COUNT) + 1;
  return `var(--wheel-${slot})`;
}
