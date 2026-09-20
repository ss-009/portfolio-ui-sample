# portfolio-ui-sample

顧客の保有株式ポートフォリオを表示する Web アプリケーション（ポートフォリオ UI のサンプル実装）。
機能仕様の詳細は [`task.md`](task.md) を参照。

## 技術スタック

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- スタイリング: [Tailwind CSS v4](https://tailwindcss.com)
- Lint / Format: ESLint (`eslint-config-next`) + Prettier
- テスト: [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react)
- パッケージマネージャ: pnpm

## セットアップ・起動

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) で確認できる。

## 主なコマンド

| コマンド            | 内容                            |
| ------------------- | ------------------------------- |
| `pnpm dev`          | 開発サーバー起動                |
| `pnpm build`        | 本番ビルド                      |
| `pnpm start`        | 本番ビルドの起動                |
| `pnpm lint`         | ESLint                          |
| `pnpm format`       | Prettier で自動整形             |
| `pnpm format:check` | Prettier のフォーマットチェック |
| `pnpm test`         | Vitest によるテスト実行（一回） |
| `pnpm test:watch`   | Vitest をウォッチモードで実行   |

## 実装概要

- `docs/dummy_response.json` をダミーAPIレスポンスとし、Next.js の Route Handler（`src/app/api/portfolio/route.ts`）経由でクライアントから取得する構成。
- API 境界（snake_case）とアプリ内ドメインモデル（camelCase）を `src/types/` と `src/lib/mapPortfolio.ts` で分離。
- ドーナツ型パイチャート（`src/components/portfolio/DonutChart.tsx`）は SVG を自前実装し、12時起点・保有比率降順・時計回りの角度計算を `src/lib/donut.ts` に切り出してユニットテスト可能にしている。
- パイチャートと保有銘柄一覧のフォーカス状態は `src/components/portfolio/PortfolioView.tsx` が単一の state として保持し、双方に伝播する。フォーカス中はドーナツ中央の表示も、ポートフォリオ全体の合計からその銘柄個別の金額・損益・保有比率に切り替わる。
- 評価損益の色（緑/赤/グレー）は Anthropic の dataviz ガイドラインの検証済みステータスカラーを採用。チャートの配色はあえて彩度の高い「ゲームホイール」風パレット（`src/app/globals.css` の CSS カスタムプロパティ）にし、アプリ全体の落ち着いたトーンとの対比を出している。
- ドーナツ中央の金額・損益表示は、文字数に応じた事前区分ではなく `src/hooks/useShrinkToFit.ts` で実際の描画幅を測定して自動縮小する（桁数が増えても崩れない）。
- 保有銘柄一覧の各行は、カード内幅が約392px（ドーナツチャートが縮み始める実際のしきい値と同じ）を下回ると、横並びから「上段: ロゴ+銘柄名」「下段: 金額」の縦2段レイアウトに切り替わる。
- ドーナツチャートが画面上部から半分以上スクロールアウトすると、右下に最上部へ戻るボタン（`src/components/portfolio/ScrollToTopButton.tsx`）を表示する（`IntersectionObserver` で可視割合を監視）。

## テストの方針

- `src/lib/*.test.ts`: 金額/パーセント表示のフォーマット、ドーナツチャートの角度計算・SVG path 生成、API レスポンスの変換ロジックを検証。
- `src/hooks/useShrinkToFit.test.tsx`: 描画幅に応じた縮小率の計算ロジックを検証。
- `src/components/portfolio/DonutChart.test.tsx`: 収まらない場合に％と（＋円）を2行に分ける切り替え判定を検証。
- `src/app/api/portfolio/route.test.ts`: APIルート自体がダミーレスポンスを正しく返すか。
- `src/components/portfolio/AssetLogo.test.tsx`: ロゴ画像読み込み失敗時のフォールバック表示。
- `src/components/portfolio/ScrollToTopButton.test.tsx`: チャートの可視割合に応じた表示/非表示の切り替え、クリック時のスクロール動作。
- `src/components/portfolio/PortfolioView.test.tsx`: 読み込み中/エラー時の表示、チャートと一覧のフォーカス連動（クリックでフォーカス/半透過、再クリックで解除、ホバー・キーボードフォーカス中の一時解除、他要素クリックで解除、中央表示の切り替え）を統合的に検証。
