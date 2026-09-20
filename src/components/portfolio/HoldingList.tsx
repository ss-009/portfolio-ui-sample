"use client";

import { HoldingListItem } from "@/components/portfolio/HoldingListItem";
import { getWheelColorVar, sortHoldingsByRatioDesc } from "@/lib/donut";
import type { Holding } from "@/types/portfolio";

interface HoldingListProps {
  holdings: Holding[];
  focusedTicker: string | null;
  onToggleFocus: (ticker: string) => void;
}

export function HoldingList({ holdings, focusedTicker, onToggleFocus }: HoldingListProps) {
  const sorted = sortHoldingsByRatioDesc(holdings);
  const hasFocus = focusedTicker !== null;

  return (
    <ul className="flex flex-col gap-2.5" aria-label="保有銘柄一覧">
      {sorted.map((holding, index) => {
        const ticker = holding.asset.tickerSymbol;
        const isFocused = focusedTicker === ticker;
        return (
          <HoldingListItem
            key={ticker}
            holding={holding}
            colorVar={getWheelColorVar(index)}
            isFocused={isFocused}
            isDimmed={hasFocus && !isFocused}
            onToggleFocus={onToggleFocus}
          />
        );
      })}
    </ul>
  );
}
