import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AssetLogo } from "@/components/portfolio/AssetLogo";

describe("AssetLogo", () => {
  it("通常時はロゴ画像を表示する", () => {
    render(
      <AssetLogo
        src="https://example.com/logo.svg"
        alt="Example Inc."
        tickerSymbol="EX"
        colorVar="var(--wheel-1)"
      />,
    );

    const img = screen.getByRole("img", { name: "Example Inc." });
    expect(img).toHaveAttribute("src", "https://example.com/logo.svg");
  });

  it("画像の読み込みに失敗したら、ティッカーの頭文字バッジにフォールバックする", () => {
    render(
      <AssetLogo
        src="https://example.com/broken.svg"
        alt="Example Inc."
        tickerSymbol="EX"
        colorVar="var(--wheel-1)"
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Example Inc." }));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("EX")).toBeInTheDocument();
  });

  it("フォールバックのバッジは、ティッカーの先頭2文字のみ表示する", () => {
    render(
      <AssetLogo
        src="https://example.com/broken.svg"
        alt="Example Inc."
        tickerSymbol="GOOGL"
        colorVar="var(--wheel-1)"
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Example Inc." }));

    expect(screen.getByText("GO")).toBeInTheDocument();
  });
});
