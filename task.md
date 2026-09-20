# 機能仕様: 保有株式ポートフォリオ表示 Web アプリケーション

関連資料: [`docs/dummy_response.json`](docs/dummy_response.json)

## 概要

顧客の保有株式のポートフォリオを表示する簡易な Web アプリケーションを作成する。

- 添付 JSON を API のダミーレスポンス（モックデータ）として利用してデータを取得する
- レスポンスから保有株式情報を取得し、要件を満たす UI を動的に構築する

## API レスポンス仕様

```jsonc
{
  "total_asset_amount": 115500, // 資産総額 (円, Int)
  "total_gain_amount": 15500, // 評価損益額 (円, Int)
  "total_gain_ratio": 15.5, // 評価損益率 (%, Float)
  "holding_assets": [
    // 保有銘柄情報 (Array)
    {
      "asset": {
        "name": "S&P 500 ETF (Vanguard)", // 銘柄名
        "ticker_symbol": "VOO", // ティッカーシンボル
        "logo_url": "https://.../VOO.svg", // ロゴURL
      },
      "asset_amount": 45969, // 銘柄の保有金額 (円, Int)
      "gain_amount": 5242, // 銘柄の評価損益額 (円, Int)
      "gain_ratio": 12.87, // 銘柄の評価損益率 (%, Float)
      "holding_ratio": 39.8, // ポートフォリオ内の保有割合 (%, Float)
    },
    // ...
  ],
}
```

実データは [`docs/dummy_response.json`](docs/dummy_response.json) を参照（7銘柄: VOO, NVDA, GOOGL, AAPL, TSLA, PLTR, NET）。
`gain_amount` / `gain_ratio` はマイナス値あり（例: AAPL は -339円 / -2.8%）→ プラス/マイナス/ゼロの3状態を考慮する必要あり。

## UI 要件

大枠構成:

1. **画面上部: ドーナツ型パイチャート**
   - 構成要素は保有銘柄。各要素の角度は `holding_ratio` に比例
   - 12時の位置を起点に、**保有比率の大きい順に時計回り**に配置
   - ドーナツの中央に以下を表示:
     - 資産総額（円）
     - 評価損益額（円）
     - 評価損益率（%）
   - 評価損益の色分け: プラス = 緑 / マイナス = 赤 / ゼロ = グレー（金額・率の両テキストに適用）
2. **パイチャート下: 保有銘柄一覧**
   - 各銘柄ごとに表示: 銘柄ロゴ画像 / 銘柄名 / ティッカーシンボル / 評価損益額（円） / 評価損益率（%）
3. **インタラクション**
   - パイチャートの要素をクリック/タップ → その要素をフォーカスし、他要素は半透過表示
   - 連動して、一覧側もフォーカス対象以外を半透過表示（フォーカス銘柄のみ目立たせる）
   - フォーカス中に、フォーカス要素以外をクリック → フォーカス解除

> 要件で言及のない仕様/デザインは実装者の裁量とする。

## 制約

- **Next.js** を用いた SPA（バージョンはできるだけ最新）
- **TypeScript** で記述
- リンター・フォーマッターを適切に設定（ツールは任意）
- 最新版 **Google Chrome** で正しく動作すること
- **PC / スマートフォン** 表示対応（レスポンシブデザイン）
- パイチャートはサードパーティ製グラフライブラリの利用可
- スタイルは自前で記述すること
  - 利用可: CSS in JS, CSS Modules, Sass
  - 利用可（付随ライブラリ）: グラフライブラリ内包スタイル / リセット系 CSS / Tailwind 等ユーティリティファースト CSS フレームワーク
- テストケース/テストコードを作成すること（対象・ツールは任意、実行時にエラーが出ないこと）
- `pnpm install` / `pnpm dev` で起動し `http://localhost:3000` で動作確認できること

## 実装チェックリスト

- [x] Next.js (最新) + TypeScript プロジェクト初期化（pnpm, App Router, Tailwind CSS v4）
- [x] Lint / Formatter 設定（ESLint + Prettier）
- [x] テストランナー設定（Vitest + React Testing Library）
- [x] ダミー JSON を取得する仕組み（API 層 / モック: `src/app/api/portfolio/route.ts`）
- [x] 型定義（API レスポンス snake_case ⇔ ドメインモデル camelCase: `src/types/`, `src/lib/mapPortfolio.ts`）
- [x] ドーナツ型パイチャート（12時起点・降順時計回り・中央サマリー表示・損益色分け: `src/components/portfolio/DonutChart.tsx`, `src/lib/donut.ts`）
- [x] 保有銘柄一覧（ロゴ・銘柄名・ティッカー・損益額・損益率: `src/components/portfolio/HoldingList.tsx`）
- [x] パイチャート ⇔ 一覧のフォーカス連動（半透過・解除: `src/components/portfolio/PortfolioView.tsx`）
- [x] レスポンシブ対応（PC / スマートフォン）
- [x] テストコード作成（`src/lib/*.test.ts`, `src/hooks/*.test.tsx`, `src/app/api/portfolio/route.test.ts`, `src/components/portfolio/*.test.tsx`、計59ケース）
- [x] `pnpm install` / `pnpm dev` → `localhost:3000` で動作確認
