"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DonutChart } from "@/components/portfolio/DonutChart";
import { HoldingList } from "@/components/portfolio/HoldingList";
import { PortfolioError } from "@/components/portfolio/PortfolioError";
import { PortfolioSkeleton } from "@/components/portfolio/PortfolioSkeleton";
import { ScrollToTopButton } from "@/components/portfolio/ScrollToTopButton";
import { usePortfolio } from "@/hooks/usePortfolio";

export function PortfolioView() {
  const state = usePortfolio();
  const [focusedTicker, setFocusedTicker] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const toggleFocus = useCallback((ticker: string) => {
    setFocusedTicker((current) => (current === ticker ? null : ticker));
  }, []);

  const clearFocus = useCallback(() => setFocusedTicker(null), []);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocusedTicker(null);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  if (state.status === "loading") {
    return <PortfolioSkeleton />;
  }

  if (state.status === "error") {
    return <PortfolioError message={state.message} />;
  }

  const { data } = state;

  return (
    <>
      <div ref={containerRef} data-testid="portfolio-view" onClick={clearFocus}>
        <div ref={chartRef}>
          <DonutChart
            holdings={data.holdingAssets}
            totalAssetAmount={data.totalAssetAmount}
            totalGainAmount={data.totalGainAmount}
            totalGainRatio={data.totalGainRatio}
            focusedTicker={focusedTicker}
            onToggleFocus={toggleFocus}
          />
        </div>

        <div className="mt-8">
          <HoldingList
            holdings={data.holdingAssets}
            focusedTicker={focusedTicker}
            onToggleFocus={toggleFocus}
          />
        </div>
      </div>

      <ScrollToTopButton watchRef={chartRef} />
    </>
  );
}
