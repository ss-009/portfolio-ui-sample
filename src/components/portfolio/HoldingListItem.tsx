"use client";

import { useState } from "react";
import { AssetLogo } from "@/components/portfolio/AssetLogo";
import {
  formatPercent,
  formatSignedPercent,
  formatSignedYen,
  formatYen,
  GAIN_TONE_TEXT_CLASS,
  getGainTone,
} from "@/lib/format";
import type { Holding } from "@/types/portfolio";

interface HoldingListItemProps {
  holding: Holding;
  colorVar: string;
  isFocused: boolean;
  isDimmed: boolean;
  onToggleFocus: (ticker: string) => void;
}

export function HoldingListItem({
  holding,
  colorVar,
  isFocused,
  isDimmed,
  onToggleFocus,
}: HoldingListItemProps) {
  const tone = getGainTone(holding.gainAmount);
  const ticker = holding.asset.tickerSymbol;
  const [isActive, setIsActive] = useState(false);
  const effectiveOpacity = isDimmed && !isActive ? 0.4 : 1;

  return (
    <li
      role="button"
      tabIndex={0}
      aria-pressed={isFocused}
      // 392px は DonutChart の max-w-80（320px）にページ/カードの左右余白
      // （16px×2 + 20px×2）を足した、チャートが縮み始める実際のしきい値と揃えている。
      // それより狭い幅では、ロゴ・銘柄名・金額を横一列に並べる余裕がないため、
      // 上段（ロゴ＋銘柄名）と下段（金額）の縦2段に分ける。
      className="flex cursor-pointer flex-col gap-0 rounded-2xl border py-3 pr-3 pl-4 transition-[opacity,background-color,border-color,box-shadow,transform] duration-200 ease-out outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-(--ink-primary)/40 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99] min-[392px]:flex-row min-[392px]:items-center min-[392px]:gap-3 lg:py-4 lg:pr-4 lg:pl-5"
      style={{
        opacity: effectiveOpacity,
        borderColor: isFocused ? colorVar : "var(--border-hairline)",
        backgroundColor: isFocused ? "var(--surface-focused)" : "var(--surface-card)",
      }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      onClick={(event) => {
        event.stopPropagation();
        onToggleFocus(ticker);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onToggleFocus(ticker);
        }
      }}
    >
      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <span
          className="absolute top-1/2 left-1.5 h-7 w-1 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: colorVar }}
          aria-hidden="true"
        />

        <AssetLogo
          src={holding.asset.logoUrl}
          alt={holding.asset.name}
          tickerSymbol={ticker}
          colorVar={colorVar}
        />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium wrap-break-word text-(--ink-primary) sm:text-base">
            {holding.asset.name}
          </p>
          <p className="mt-0.5 text-xs text-(--ink-secondary)">
            {ticker} / {formatPercent(holding.holdingRatio)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right tabular-nums">
        <p className="text-sm font-medium text-(--ink-primary) sm:text-base">
          {formatYen(holding.assetAmount)}
        </p>
        <p className={`mt-0.5 text-xs font-medium sm:text-sm ${GAIN_TONE_TEXT_CLASS[tone]}`}>
          {formatSignedPercent(holding.gainRatio)}（{formatSignedYen(holding.gainAmount)}）
        </p>
      </div>
    </li>
  );
}
