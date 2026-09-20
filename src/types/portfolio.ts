/**
 * アプリ内で扱うドメインモデル（camelCase）。
 * API境界（`lib/mapPortfolio.ts`）で snake_case から変換する。
 */
export interface Asset {
  name: string;
  tickerSymbol: string;
  logoUrl: string;
}

export interface Holding {
  asset: Asset;
  assetAmount: number;
  gainAmount: number;
  gainRatio: number;
  holdingRatio: number;
}

export interface Portfolio {
  totalAssetAmount: number;
  totalGainAmount: number;
  totalGainRatio: number;
  holdingAssets: Holding[];
}
