import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GainDisplay } from "@/components/portfolio/DonutChart";

// jsdom は実レイアウトを計算しないため、HTMLElement.prototype の clientWidth/scrollWidth
// を差し替えて、useShrinkToFit が「収まる/収まらない」と判定する状況を再現する。
let originalClientWidth: PropertyDescriptor | undefined;
let originalScrollWidth: PropertyDescriptor | undefined;

beforeEach(() => {
  originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
  originalScrollWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
});

afterEach(() => {
  if (originalClientWidth) {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
  }
  if (originalScrollWidth) {
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", originalScrollWidth);
  }
});

function mockLayout(clientWidth: number, scrollWidth: number) {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    value: clientWidth,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    value: scrollWidth,
  });
}

describe("GainDisplay", () => {
  it("枠に収まる場合は「％（＋円）」を1行にまとめて表示する", () => {
    mockLayout(200, 100); // 枠(200) >= 内容(100) なので縮小しきい値を下回らない

    render(
      <GainDisplay
        ratioText="+15.50%"
        amountText="+¥15,500"
        badgeClassName="badge"
        amountClassName="amount"
      />,
    );

    expect(screen.getByText("+15.50%（+¥15,500）")).toBeInTheDocument();
  });

  it("枠に収まらない場合は％と（＋円）を2行に分ける", () => {
    mockLayout(100, 300); // 縮小率 100/300 ≈ 0.33 はしきい値(0.95)を下回る

    render(
      <GainDisplay
        ratioText="+15.50%"
        amountText="+¥15,500"
        badgeClassName="badge"
        amountClassName="amount"
      />,
    );

    expect(screen.getByText("+15.50%")).toBeInTheDocument();
    expect(screen.getByText("（+¥15,500）")).toBeInTheDocument();
    expect(screen.queryByText("+15.50%（+¥15,500）")).not.toBeInTheDocument();
  });
});
