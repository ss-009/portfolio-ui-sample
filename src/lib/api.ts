import { mapPortfolioResponse } from "@/lib/mapPortfolio";
import type { PortfolioApiResponse } from "@/types/api";
import type { Portfolio } from "@/types/portfolio";

export class PortfolioFetchError extends Error {}

export async function fetchPortfolio(signal?: AbortSignal): Promise<Portfolio> {
  const res = await fetch("/api/portfolio", { signal });

  if (!res.ok) {
    throw new PortfolioFetchError(`ポートフォリオの取得に失敗しました (status: ${res.status})`);
  }

  const data = (await res.json()) as PortfolioApiResponse;
  return mapPortfolioResponse(data);
}
