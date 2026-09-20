export function PortfolioSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">読み込み中です</span>
      <div className="mx-auto aspect-square w-full max-w-80 rounded-full bg-(--surface-muted)" />
      <div className="mt-8 flex flex-col gap-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-18 rounded-2xl bg-(--surface-muted)" />
        ))}
      </div>
    </div>
  );
}
