interface PortfolioErrorProps {
  message: string;
}

export function PortfolioError({ message }: PortfolioErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-(--gain-negative)/30 bg-(--gain-negative)/5 px-4 py-6 text-center text-sm text-(--gain-negative)"
    >
      <p className="font-medium">ポートフォリオを読み込めませんでした</p>
      <p className="mt-1 text-(--ink-secondary)">{message}</p>
    </div>
  );
}
