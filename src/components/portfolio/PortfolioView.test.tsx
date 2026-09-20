import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import type { PortfolioApiResponse } from "@/types/api";

const mockResponse: PortfolioApiResponse = {
  total_asset_amount: 100,
  total_gain_amount: 10,
  total_gain_ratio: 10,
  holding_assets: [
    {
      asset: { name: "Alpha", ticker_symbol: "ALP", logo_url: "https://example.com/a.svg" },
      asset_amount: 60,
      gain_amount: 6,
      gain_ratio: 10,
      holding_ratio: 60,
    },
    {
      asset: { name: "Beta", ticker_symbol: "BET", logo_url: "https://example.com/b.svg" },
      asset_amount: 40,
      gain_amount: 4,
      gain_ratio: 10,
      holding_ratio: 40,
    },
  ],
};

function stubFetchSuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PortfolioView", () => {
  it("取得成功後、チャートと保有銘柄一覧を表示する", async () => {
    stubFetchSuccess();
    render(<PortfolioView />);

    expect(await screen.findByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("読み込み中はスケルトンを表示する", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})), // 意図的に解決させない
    );

    render(<PortfolioView />);

    expect(screen.getByText("読み込み中です")).toBeInTheDocument();
  });

  it("APIエラー時はエラーメッセージを表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    );

    render(<PortfolioView />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  describe("フォーカスの連動", () => {
    beforeEach(() => {
      stubFetchSuccess();
    });

    it("チャートのセグメントをクリックすると、一覧側も含めて他要素が半透過になる", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const list = screen.getByRole("list", { name: "保有銘柄一覧" });

      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const betaSegment = within(chart).getByRole("button", { name: /Beta/ });
      const alphaItem = within(list).getByRole("button", { name: /Alpha/ });
      const betaItem = within(list).getByRole("button", { name: /Beta/ });

      await user.click(alphaSegment);

      expect(alphaSegment).toHaveAttribute("aria-pressed", "true");
      expect(betaSegment).toHaveAttribute("aria-pressed", "false");
      expect((betaSegment as unknown as SVGElement).style.opacity).toBe("0.32");
      expect((alphaSegment as unknown as SVGElement).style.opacity).toBe("1");

      // 一覧側もフォーカス対象以外が半透過になる
      expect(alphaItem).toHaveAttribute("aria-pressed", "true");
      expect(betaItem.style.opacity).toBe("0.4");
      expect(alphaItem.style.opacity).toBe("1");
    });

    it("セグメントをクリックすると、中央表示がその銘柄の金額・損益に切り替わる", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const center = screen.getByTestId("donut-center");

      // フォーカス前は合計（¥100）を表示
      expect(within(center).getByText("¥100")).toBeInTheDocument();

      await user.click(alphaSegment);

      // フォーカス中は Alpha 単体の金額（¥60）とティッカー・保有比率を表示
      expect(within(center).getByText("ALP")).toBeInTheDocument();
      expect(within(center).getByText("60.0%")).toBeInTheDocument();
      expect(within(center).getByText("¥60")).toBeInTheDocument();
      expect(within(center).queryByText("¥100")).not.toBeInTheDocument();

      await user.click(alphaSegment);

      // フォーカス解除で合計表示に戻る
      expect(within(center).getByText("¥100")).toBeInTheDocument();
      expect(within(center).queryByText("ALP")).not.toBeInTheDocument();
    });

    it("同じセグメントをもう一度クリックするとフォーカスを解除する", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const betaSegment = within(chart).getByRole("button", { name: /Beta/ });

      await user.click(alphaSegment);
      await user.click(alphaSegment);

      expect(alphaSegment).toHaveAttribute("aria-pressed", "false");
      expect((betaSegment as unknown as SVGElement).style.opacity).toBe("1");
    });

    it("一覧の項目をクリックしてもフォーカスが切り替わる（チャートと一覧は同じ状態を共有する）", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const list = screen.getByRole("list", { name: "保有銘柄一覧" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const betaItem = within(list).getByRole("button", { name: /Beta/ });

      await user.click(betaItem);

      expect(betaItem).toHaveAttribute("aria-pressed", "true");
      expect((alphaSegment as unknown as SVGElement).style.opacity).toBe("0.32");
    });

    it("フォーカス中に他の場所をクリックするとフォーカスを解除する", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });

      await user.click(alphaSegment);
      expect(alphaSegment).toHaveAttribute("aria-pressed", "true");

      await user.click(screen.getByTestId("portfolio-view"));

      expect(alphaSegment).toHaveAttribute("aria-pressed", "false");
      expect((alphaSegment as unknown as SVGElement).style.opacity).toBe("1");
    });

    it("他をフォーカス中でも、ホバー中は一時的に不透明度を戻す（チャート）", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const betaSegment = within(chart).getByRole("button", {
        name: /Beta/,
      }) as unknown as SVGElement;

      await user.click(alphaSegment);
      expect(betaSegment.style.opacity).toBe("0.32");

      await user.hover(betaSegment);
      expect(betaSegment.style.opacity).toBe("1");

      await user.unhover(betaSegment);
      expect(betaSegment.style.opacity).toBe("0.32");
    });

    it("他をフォーカス中でも、ホバー中は一時的に不透明度を戻す（一覧）", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const list = screen.getByRole("list", { name: "保有銘柄一覧" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const betaItem = within(list).getByRole("button", { name: /Beta/ });

      await user.click(alphaSegment);
      expect(betaItem.style.opacity).toBe("0.4");

      await user.hover(betaItem);
      expect(betaItem.style.opacity).toBe("1");

      await user.unhover(betaItem);
      expect(betaItem.style.opacity).toBe("0.4");
    });

    it("他をフォーカス中でも、キーボードフォーカス中は一時的に不透明度を戻す（チャート）", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const betaSegment = within(chart).getByRole("button", {
        name: /Beta/,
      }) as unknown as SVGElement;

      await user.click(alphaSegment);
      expect(betaSegment.style.opacity).toBe("0.32");

      fireEvent.focus(betaSegment);
      expect(betaSegment.style.opacity).toBe("1");

      fireEvent.blur(betaSegment);
      expect(betaSegment.style.opacity).toBe("0.32");
    });

    it("他をフォーカス中でも、キーボードフォーカス中は一時的に不透明度を戻す（一覧）", async () => {
      const user = userEvent.setup();
      render(<PortfolioView />);
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const list = screen.getByRole("list", { name: "保有銘柄一覧" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });
      const betaItem = within(list).getByRole("button", { name: /Beta/ });

      await user.click(alphaSegment);
      expect(betaItem.style.opacity).toBe("0.4");

      fireEvent.focus(betaItem);
      expect(betaItem.style.opacity).toBe("1");

      fireEvent.blur(betaItem);
      expect(betaItem.style.opacity).toBe("0.4");
    });

    it("PortfolioView の外側（ページの他の領域）をクリックしてもフォーカスを解除する", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <h1>ページタイトル</h1>
          <PortfolioView />
        </div>,
      );
      await screen.findByText("Alpha");

      const chart = screen.getByRole("group", { name: "保有銘柄の構成比率" });
      const alphaSegment = within(chart).getByRole("button", { name: /Alpha/ });

      await user.click(alphaSegment);
      expect(alphaSegment).toHaveAttribute("aria-pressed", "true");

      await user.click(screen.getByText("ページタイトル"));

      expect(alphaSegment).toHaveAttribute("aria-pressed", "false");
      expect((alphaSegment as unknown as SVGElement).style.opacity).toBe("1");
    });
  });
});
