import { PortfolioView } from "@/components/portfolio/PortfolioView";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center px-4 pt-6 pb-10 sm:pt-10 sm:pb-16">
      <main className="w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <header className="mb-6 px-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-(--ink-secondary) uppercase">
            Portfolio
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--ink-primary) sm:text-3xl lg:text-4xl">
            保有ポートフォリオ
          </h1>
        </header>

        <div className="rounded-3xl border border-(--border-hairline) bg-(--surface-card) p-5 shadow-xl shadow-black/5 sm:p-8 lg:p-10 dark:shadow-black/30">
          <PortfolioView />
        </div>
      </main>
    </div>
  );
}
