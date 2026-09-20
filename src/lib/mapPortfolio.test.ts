import { describe, expect, it } from "vitest";
import { mapPortfolioResponse } from "@/lib/mapPortfolio";
import type { PortfolioApiResponse } from "@/types/api";

describe("mapPortfolioResponse", () => {
  it("snake_case の API レスポンスを camelCase のドメインモデルに変換する", () => {
    const response: PortfolioApiResponse = {
      total_asset_amount: 115500,
      total_gain_amount: 15500,
      total_gain_ratio: 15.5,
      holding_assets: [
        {
          asset: {
            name: "S&P 500 ETF (Vanguard)",
            ticker_symbol: "VOO",
            logo_url: "https://example.com/VOO.svg",
          },
          asset_amount: 45969,
          gain_amount: 5242,
          gain_ratio: 12.87,
          holding_ratio: 39.8,
        },
      ],
    };

    expect(mapPortfolioResponse(response)).toEqual({
      totalAssetAmount: 115500,
      totalGainAmount: 15500,
      totalGainRatio: 15.5,
      holdingAssets: [
        {
          asset: {
            name: "S&P 500 ETF (Vanguard)",
            tickerSymbol: "VOO",
            logoUrl: "https://example.com/VOO.svg",
          },
          assetAmount: 45969,
          gainAmount: 5242,
          gainRatio: 12.87,
          holdingRatio: 39.8,
        },
      ],
    });
  });

  it("保有銘柄が空でも変換できる", () => {
    const response: PortfolioApiResponse = {
      total_asset_amount: 0,
      total_gain_amount: 0,
      total_gain_ratio: 0,
      holding_assets: [],
    };

    expect(mapPortfolioResponse(response).holdingAssets).toEqual([]);
  });
});
