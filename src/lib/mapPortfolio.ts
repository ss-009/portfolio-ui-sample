import type { PortfolioApiResponse } from "@/types/api";
import type { Portfolio } from "@/types/portfolio";

export function mapPortfolioResponse(response: PortfolioApiResponse): Portfolio {
  return {
    totalAssetAmount: response.total_asset_amount,
    totalGainAmount: response.total_gain_amount,
    totalGainRatio: response.total_gain_ratio,
    holdingAssets: response.holding_assets.map((holding) => ({
      asset: {
        name: holding.asset.name,
        tickerSymbol: holding.asset.ticker_symbol,
        logoUrl: holding.asset.logo_url,
      },
      assetAmount: holding.asset_amount,
      gainAmount: holding.gain_amount,
      gainRatio: holding.gain_ratio,
      holdingRatio: holding.holding_ratio,
    })),
  };
}
