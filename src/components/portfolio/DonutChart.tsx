"use client";

import { useState } from "react";
import { buildDonutSegments, getWheelColorVar } from "@/lib/donut";
import {
  formatPercent,
  formatSignedPercent,
  formatSignedYen,
  formatYen,
  GAIN_TONE_BADGE_CLASS,
  GAIN_TONE_TEXT_CLASS,
  getGainTone,
} from "@/lib/format";
import { useShrinkToFit } from "@/hooks/useShrinkToFit";
import type { Holding } from "@/types/portfolio";

interface DonutChartProps {
  holdings: Holding[];
  totalAssetAmount: number;
  totalGainAmount: number;
  totalGainRatio: number;
  focusedTicker: string | null;
  onToggleFocus: (ticker: string) => void;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 108;
const INNER_RADIUS = 60;
const SEGMENT_DIVIDER_WIDTH = 3;

const HOLE_DIAMETER_RATIO = (INNER_RADIUS * 2) / SIZE;
const CENTER_TEXT_MAX_WIDTH = `${HOLE_DIAMETER_RATIO * 82}%`;

function CenterLine({ text, className }: { text: string; className: string }) {
  const { containerRef, contentRef, scale } = useShrinkToFit<HTMLDivElement, HTMLSpanElement>([
    text,
  ]);

  return (
    <div ref={containerRef} className="flex w-full justify-center overflow-visible">
      <span
        ref={contentRef}
        className={`shrink-0 whitespace-nowrap ${className}`}
        style={{ transform: `scale(${scale})` }}
      >
        {text}
      </span>
    </div>
  );
}

const GAIN_WRAP_SCALE_THRESHOLD = 0.95;

export function GainDisplay({
  ratioText,
  amountText,
  badgeClassName,
  amountClassName,
}: {
  ratioText: string;
  amountText: string;
  badgeClassName: string;
  amountClassName: string;
}) {
  const combinedText = `${ratioText}（${amountText}）`;
  const { containerRef, contentRef, scale } = useShrinkToFit<HTMLDivElement, HTMLSpanElement>([
    combinedText,
  ]);

  if (scale < GAIN_WRAP_SCALE_THRESHOLD) {
    return (
      <div className="flex flex-col items-center gap-0.5 sm:gap-2">
        <CenterLine text={ratioText} className={badgeClassName} />
        <CenterLine text={`（${amountText}）`} className={amountClassName} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex w-full justify-center overflow-visible">
      <span
        ref={contentRef}
        className={`shrink-0 whitespace-nowrap ${badgeClassName}`}
        style={{ transform: `scale(${scale})` }}
      >
        {combinedText}
      </span>
    </div>
  );
}

export function DonutChart({
  holdings,
  totalAssetAmount,
  totalGainAmount,
  totalGainRatio,
  focusedTicker,
  onToggleFocus,
}: DonutChartProps) {
  const [activeTicker, setActiveTicker] = useState<string | null>(null);

  const segments = buildDonutSegments(holdings, {
    cx: CENTER,
    cy: CENTER,
    outerRadius: OUTER_RADIUS,
    innerRadius: INNER_RADIUS,
  });

  const hasFocus = focusedTicker !== null;
  const focusedHolding = holdings.find((h) => h.asset.tickerSymbol === focusedTicker) ?? null;

  const displayAssetAmount = focusedHolding?.assetAmount ?? totalAssetAmount;
  const displayGainAmount = focusedHolding?.gainAmount ?? totalGainAmount;
  const displayGainRatio = focusedHolding?.gainRatio ?? totalGainRatio;

  const tone = getGainTone(displayGainAmount);
  const formattedTotal = formatYen(displayAssetAmount);
  const formattedGainRatio = formatSignedPercent(displayGainRatio);
  const formattedGainAmount = formatSignedYen(displayGainAmount);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-80 lg:max-w-96">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        role="group"
        aria-label="保有銘柄の構成比率"
      >
        {segments.map((segment, index) => {
          const isFocused = focusedTicker === segment.ticker;
          const isActive = activeTicker === segment.ticker;
          const isDimmed = hasFocus && !isFocused && !isActive;
          return (
            <path
              key={segment.ticker}
              d={segment.path}
              fill={getWheelColorVar(index)}
              stroke="var(--surface-card)"
              strokeWidth={SEGMENT_DIVIDER_WIDTH}
              strokeLinejoin="round"
              role="button"
              tabIndex={0}
              aria-pressed={isFocused}
              aria-label={`${segment.holding.asset.name} (${segment.ticker}) 保有比率 ${formatPercent(segment.holding.holdingRatio)}`}
              className="cursor-pointer transition-[opacity,filter] duration-200 ease-out outline-none hover:brightness-110 focus-visible:opacity-80"
              style={{ opacity: isDimmed ? 0.32 : 1 }}
              onMouseEnter={() => setActiveTicker(segment.ticker)}
              onMouseLeave={() => setActiveTicker(null)}
              onFocus={() => setActiveTicker(segment.ticker)}
              onBlur={() => setActiveTicker(null)}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFocus(segment.ticker);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggleFocus(segment.ticker);
                }
              }}
            />
          );
        })}
      </svg>

      <div
        data-testid="donut-center"
        className="pointer-events-none absolute top-1/2 left-1/2 flex flex-col items-center justify-center text-center"
        style={{
          width: CENTER_TEXT_MAX_WIDTH,
          height: CENTER_TEXT_MAX_WIDTH,
          transform: "translate(-50%, calc(-50% + 10px))",
        }}
      >
        {/*
          ティッカーラベルは、通常のフローではなくこの relative ラッパーに
          absolute で重ねる。フローに入れると表示/非表示で高さが変わり、
          justify-center の都合で資産額の位置自体がずれてしまうため。
        */}
        <div className="relative flex w-full flex-col items-center gap-1 sm:gap-2">
          {focusedHolding && (
            <div className="absolute bottom-full left-1/2 mb-1 flex w-full -translate-x-1/2 flex-col items-center gap-0.5 sm:mb-1.5">
              <CenterLine
                text={focusedHolding.asset.tickerSymbol}
                className="text-[10px] leading-none font-semibold tracking-widest text-(--ink-secondary) uppercase sm:text-[11px] lg:text-xs"
              />
              <CenterLine
                text={formatPercent(focusedHolding.holdingRatio)}
                className="text-[10px] leading-none text-(--ink-secondary) sm:text-[11px] lg:text-xs"
              />
            </div>
          )}
          <CenterLine
            text={formattedTotal}
            className="text-2xl leading-none font-bold tracking-tight text-(--ink-primary) sm:text-3xl lg:text-4xl"
          />
          <GainDisplay
            ratioText={formattedGainRatio}
            amountText={formattedGainAmount}
            badgeClassName={`inline-block rounded-full px-2.5 py-1 text-base leading-none font-bold sm:text-lg lg:text-xl ${GAIN_TONE_BADGE_CLASS[tone]}`}
            amountClassName={`text-sm leading-none font-semibold sm:text-base lg:text-lg ${GAIN_TONE_TEXT_CLASS[tone]}`}
          />
        </div>
      </div>
    </div>
  );
}
