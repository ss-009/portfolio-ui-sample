import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/portfolio/route";
import type { PortfolioApiResponse } from "@/types/api";

describe("GET /api/portfolio", () => {
  it("ダミーレスポンス（docs/dummy_response.json）をそのまま返す", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = (await response.json()) as PortfolioApiResponse;

    expect(data.total_asset_amount).toBe(115500);
    expect(data.total_gain_amount).toBe(15500);
    expect(data.total_gain_ratio).toBe(15.5);
    expect(data.holding_assets).toHaveLength(7);
    expect(data.holding_assets[0].asset.ticker_symbol).toBe("VOO");
    expect(data.holding_assets[0]).toEqual(
      expect.objectContaining({
        asset_amount: expect.any(Number),
        gain_amount: expect.any(Number),
        gain_ratio: expect.any(Number),
        holding_ratio: expect.any(Number),
      }),
    );
  });
});
