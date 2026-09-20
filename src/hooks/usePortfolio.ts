"use client";

import { useEffect, useState } from "react";
import { fetchPortfolio } from "@/lib/api";
import type { Portfolio } from "@/types/portfolio";

export type PortfolioState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Portfolio };

export function usePortfolio(): PortfolioState {
  const [state, setState] = useState<PortfolioState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetchPortfolio(controller.signal)
      .then((data) => setState({ status: "success", data }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const message = error instanceof Error ? error.message : "不明なエラーが発生しました";
        setState({ status: "error", message });
      });

    return () => controller.abort();
  }, []);

  return state;
}
