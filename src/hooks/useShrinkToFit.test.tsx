import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { useShrinkToFit } from "@/hooks/useShrinkToFit";

// jsdom は実レイアウトを計算しないため clientWidth/scrollWidth は常に 0 を返す。
// ここでは要素にモック値を仕込んだ上でフックを実行し、縮小率の計算ロジック自体を検証する。
function TestComponent({
  containerWidth,
  contentWidth,
  onScale,
}: {
  containerWidth: number;
  contentWidth: number;
  onScale: (scale: number) => void;
}) {
  const { containerRef, contentRef, scale } = useShrinkToFit<HTMLDivElement, HTMLSpanElement>([
    containerWidth,
    contentWidth,
  ]);
  onScale(scale);

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        if (el) {
          Object.defineProperty(el, "clientWidth", { value: containerWidth, configurable: true });
        }
      }}
    >
      <span
        ref={(el) => {
          contentRef.current = el;
          if (el) {
            Object.defineProperty(el, "scrollWidth", { value: contentWidth, configurable: true });
          }
        }}
      />
    </div>
  );
}

describe("useShrinkToFit", () => {
  it("枠に収まっている場合は縮小しない（scale: 1）", () => {
    const scales: number[] = [];
    render(
      <TestComponent containerWidth={100} contentWidth={80} onScale={(s) => scales.push(s)} />,
    );

    expect(scales.at(-1)).toBe(1);
  });

  it("枠からはみ出している場合、収まる比率まで縮小する", () => {
    const scales: number[] = [];
    render(
      <TestComponent containerWidth={100} contentWidth={200} onScale={(s) => scales.push(s)} />,
    );

    expect(scales.at(-1)).toBeCloseTo(0.5);
  });

  it("枠の幅が 0（未計測）の場合は縮小しない", () => {
    const scales: number[] = [];
    render(<TestComponent containerWidth={0} contentWidth={200} onScale={(s) => scales.push(s)} />);

    expect(scales.at(-1)).toBe(1);
  });
});
