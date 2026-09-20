/**
 * ダミーAPIのレスポンス形式（snake_case）。
 * `docs/dummy_response.json` のスキーマに対応する。
 */
export interface AssetApi {
  name: string;
  ticker_symbol: string;
  logo_url: string;
}

export interface HoldingAssetApi {
  asset: AssetApi;
  asset_amount: number;
  gain_amount: number;
  gain_ratio: number;
  holding_ratio: number;
}

export interface PortfolioApiResponse {
  total_asset_amount: number;
  total_gain_amount: number;
  total_gain_ratio: number;
  holding_assets: HoldingAssetApi[];
}
