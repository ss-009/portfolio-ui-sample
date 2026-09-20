import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { ScrollToTopButton } from "@/components/portfolio/ScrollToTopButton";

let observerCallback: IntersectionObserverCallback = () => {};
const observeMock = vi.fn();
const disconnectMock = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }

  observe = observeMock;
  disconnect = disconnectMock;
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

function fireIntersection(intersectionRatio: number) {
  act(() => {
    observerCallback(
      [{ intersectionRatio } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

function TestHarness() {
  const chartRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={chartRef} data-testid="chart" />
      <ScrollToTopButton watchRef={chartRef} />
    </div>
  );
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("ScrollToTopButton", () => {
  it("初期状態（チャートが十分見えている）では表示されない", () => {
    render(<TestHarness />);

    expect(screen.queryByRole("button", { name: "ページの先頭へ戻る" })).not.toBeInTheDocument();
  });

  it("チャートが半分以上隠れたら表示される", () => {
    render(<TestHarness />);

    fireIntersection(0.3);

    expect(screen.getByRole("button", { name: "ページの先頭へ戻る" })).toBeInTheDocument();
  });

  it("再びチャートが半分以上見えるようになったら非表示に戻る", () => {
    render(<TestHarness />);

    fireIntersection(0.2);
    expect(screen.getByRole("button", { name: "ページの先頭へ戻る" })).toBeInTheDocument();

    fireIntersection(0.8);
    expect(screen.queryByRole("button", { name: "ページの先頭へ戻る" })).not.toBeInTheDocument();
  });

  it("クリックすると画面最上部へスムーズスクロールする", () => {
    const scrollToMock = vi.fn();
    vi.stubGlobal("scrollTo", scrollToMock);
    render(<TestHarness />);
    fireIntersection(0);

    screen.getByRole("button", { name: "ページの先頭へ戻る" }).click();

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("watchRef が指す要素を監視する", () => {
    render(<TestHarness />);

    expect(observeMock).toHaveBeenCalledWith(screen.getByTestId("chart"));
  });

  it("アンマウント時に IntersectionObserver を解除する", () => {
    const { unmount } = render(<TestHarness />);

    unmount();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
