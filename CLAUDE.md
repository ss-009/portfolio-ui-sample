# CLAUDE.md

このリポジトリは、保有株式ポートフォリオを表示する Web アプリケーションのポートフォリオ（実績公開用）サンプル実装。

## まず読むもの

- [`task.md`](task.md) — 機能仕様の要約。作業前に必ず確認する。

## 現在のステータス

一通り実装済み（`task.md` の実装チェックリスト参照）。技術選定は以下の通り確定済み:

- Next.js 16 (App Router) + TypeScript + pnpm、Tailwind CSS v4
- Lint/Format: ESLint (`eslint-config-next`) + Prettier
- テスト: Vitest + React Testing Library（`pnpm test`）
- ダミーAPI: `src/app/api/portfolio/route.ts`（`docs/dummy_response.json` を直接 import して返す Route Handler。複製ファイルは作らず単一の情報源にしている）

主要ファイル:

- `src/lib/donut.ts` — ドーナツチャートの角度計算・SVG path 生成（12時起点・降順時計回りのロジック本体）
- `src/lib/format.ts` — 金額/パーセント表示、損益トーン判定（プラス/マイナス/ゼロ）
- `src/hooks/useShrinkToFit.ts` — 実描画幅を測定して収まらない分だけ縮小するフック（ドーナツ中央の金額・損益表示で使用）
- `src/components/portfolio/PortfolioView.tsx` — フォーカス状態（チャート⇔一覧の連動）を保持する親コンポーネント
- `src/components/portfolio/DonutChart.tsx` — フォーカス中はその銘柄の値、なければ合計を中央に表示する
- `src/app/globals.css` — CSS カスタムプロパティ定義。評価損益の色（`--gain-*`）は dataviz スキルの検証済みステータスカラー、チャートの配色（`--wheel-*`）はコミカルさを狙った専用パレット（ユーザー要望により、落ち着いたUI本体とは対照的にチャートだけ賑やかにしている）

## 変更してはいけないもの

- `docs/dummy_response.json` はアプリが実際に import して使う現役のデータファイル（`src/app/api/portfolio/route.ts` 参照）。表示確認のため一時的に値を変更して試すのは問題ないが、確認が終わったら元の内容に戻すこと。

## 必達の制約（`task.md` の「制約」セクションが正）

- Next.js（最新版）+ TypeScript による SPA
- パッケージマネージャは pnpm（`pnpm install` / `pnpm dev` で `localhost:3000` 起動）
- Lint / Formatter を設定する
- テストコードを用意し、実行時にエラーが出ないこと
- スタイルは自前実装（Tailwind 等のユーティリティ CSS や CSS Modules / Sass / CSS-in-JS は利用可）
- レスポンシブ対応必須（PC / スマートフォン）

## 実装時の方針

- 技術選定（グラフライブラリ = 自前SVG実装 / ESLint+Prettier / Vitest+RTL）は確定済み。変更する場合はユーザーに確認する。
- UI 挙動（パイチャートのフォーカス連動、色分けロジックなど）は `task.md` の「UI要件」を単一の正とする。要件で表現が曖昧な部分は自由裁量だが、要件本文に矛盾しないこと。
- 過度な抽象化・将来拡張を見越した設計は避け、スコープに忠実に実装する（評価観点は可読性・保守性・デザイン感度）。
- 変更を加えたら `pnpm lint` / `pnpm format:check` / `pnpm test` / `pnpm build` が通ることを確認する。
