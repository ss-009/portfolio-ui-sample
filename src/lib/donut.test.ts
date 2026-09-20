import { describe, expect, it } from "vitest";
import {
  buildDonutSegments,
  computeAngleRanges,
  describeDonutArc,
  getWheelColorVar,
  sortHoldingsByRatioDesc,
} from "@/lib/donut";
import type { Holding } from "@/types/portfolio";

function makeHolding(overrides: Partial<Holding> & { holdingRatio: number }): Holding {
  return {
    asset: {
      name: overrides.asset?.name ?? "Dummy",
      tickerSymbol: overrides.asset?.tickerSymbol ?? "DUMMY",
      logoUrl: overrides.asset?.logoUrl ?? "https://example.com/logo.svg",
    },
    assetAmount: overrides.assetAmount ?? 0,
    gainAmount: overrides.gainAmount ?? 0,
    gainRatio: overrides.gainRatio ?? 0,
    holdingRatio: overrides.holdingRatio,
  };
}

/** "M x y ..." の先頭座標を取り出す */
function firstPoint(path: string): { x: number; y: number } {
  const match = path.match(/^M\s+(-?[\d.]+)\s+(-?[\d.]+)/);
  if (!match) throw new Error(`unexpected path: ${path}`);
  return { x: Number(match[1]), y: Number(match[2]) };
}

describe("sortHoldingsByRatioDesc", () => {
  it("保有比率の降順に並び替える", () => {
    const holdings = [
      makeHolding({ holdingRatio: 10, asset: { name: "A", tickerSymbol: "A", logoUrl: "" } }),
      makeHolding({ holdingRatio: 50, asset: { name: "B", tickerSymbol: "B", logoUrl: "" } }),
      makeHolding({ holdingRatio: 40, asset: { name: "C", tickerSymbol: "C", logoUrl: "" } }),
    ];

    const sorted = sortHoldingsByRatioDesc(holdings);

    expect(sorted.map((h) => h.asset.tickerSymbol)).toEqual(["B", "C", "A"]);
  });

  it("同率のときは元の順序を保つ（安定ソート）", () => {
    const holdings = [
      makeHolding({ holdingRatio: 20, asset: { name: "A", tickerSymbol: "A", logoUrl: "" } }),
      makeHolding({ holdingRatio: 20, asset: { name: "B", tickerSymbol: "B", logoUrl: "" } }),
    ];

    expect(sortHoldingsByRatioDesc(holdings).map((h) => h.asset.tickerSymbol)).toEqual(["A", "B"]);
  });

  it("元の配列を破壊しない", () => {
    const holdings = [makeHolding({ holdingRatio: 10 }), makeHolding({ holdingRatio: 90 })];
    const original = [...holdings];

    sortHoldingsByRatioDesc(holdings);

    expect(holdings).toEqual(original);
  });
});

describe("computeAngleRanges", () => {
  it("実データ相当の比率から、12時起点で360度分の角度範囲を積み上げる", () => {
    const ratios = [39.8, 15.2, 14.7, 10.2, 9.9, 5.2, 5.0]; // 合計 100
    const holdings = ratios.map((holdingRatio) => makeHolding({ holdingRatio }));

    const ranges = computeAngleRanges(holdings);

    expect(ranges[0].startAngle).toBeCloseTo(0);
    expect(ranges[0].endAngle).toBeCloseTo(143.28); // 39.8/100 * 360

    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i].startAngle).toBeCloseTo(ranges[i - 1].endAngle);
    }

    expect(ranges.at(-1)!.endAngle).toBeCloseTo(360);
  });

  it("合計が100からずれていても、合計に対する比率で正規化する", () => {
    const holdings = [makeHolding({ holdingRatio: 25 }), makeHolding({ holdingRatio: 25 })];

    const ranges = computeAngleRanges(holdings);

    expect(ranges[0]).toEqual({ startAngle: 0, endAngle: 180 });
    expect(ranges[1].endAngle).toBeCloseTo(360);
  });

  it("空配列では空を返す", () => {
    expect(computeAngleRanges([])).toEqual([]);
  });
});

describe("describeDonutArc", () => {
  const geometry = { cx: 100, cy: 100, outerRadius: 100, innerRadius: 60 };

  it("開始角0度（12時位置）は中心の真上から始まる", () => {
    const path = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 90 });
    const { x, y } = firstPoint(path);

    expect(x).toBeCloseTo(100); // cx
    expect(y).toBeCloseTo(0); // cy - outerRadius
  });

  it("有効な path 構造（M -> A -> L -> A -> Z）を生成する", () => {
    const path = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 90 });
    expect(path).toMatch(/^M .+ A .+ L .+ A .+ Z$/);
  });

  it("180度を超えるスイープでは largeArcFlag が 1 になる", () => {
    const path = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 200 });
    const outerArcFlag = path.match(/A [\d.]+ [\d.]+ 0 (\d) 1/)?.[1];
    expect(outerArcFlag).toBe("1");
  });

  it("180度以下のスイープでは largeArcFlag が 0 になる", () => {
    const path = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 90 });
    const outerArcFlag = path.match(/A [\d.]+ [\d.]+ 0 (\d) 1/)?.[1];
    expect(outerArcFlag).toBe("0");
  });

  it("padAngle を指定すると隙間の分だけ形状が変わる", () => {
    const withoutPad = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 90, padAngle: 0 });
    const withPad = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 90, padAngle: 10 });
    expect(withPad).not.toBe(withoutPad);
  });

  it("スイープよりも大きい padAngle を指定してもクラッシュせず有効な path を返す（極小セグメント対策）", () => {
    const path = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 1, padAngle: 10 });
    expect(path).toMatch(/^M .+ A .+ L .+ A .+ Z$/);
  });

  it("1銘柄100%（完全な円）でもクラッシュせず有効な path を返す", () => {
    const path = describeDonutArc({ ...geometry, startAngle: 0, endAngle: 360 });
    expect(path).toMatch(/^M .+ A .+ L .+ A .+ Z$/);
  });
});

describe("buildDonutSegments", () => {
  it("保有比率の降順でセグメントを構築する", () => {
    const holdings = [
      makeHolding({ holdingRatio: 10, asset: { name: "A", tickerSymbol: "A", logoUrl: "" } }),
      makeHolding({ holdingRatio: 60, asset: { name: "B", tickerSymbol: "B", logoUrl: "" } }),
      makeHolding({ holdingRatio: 30, asset: { name: "C", tickerSymbol: "C", logoUrl: "" } }),
    ];

    const segments = buildDonutSegments(holdings, {
      cx: 120,
      cy: 120,
      outerRadius: 108,
      innerRadius: 68,
      padAngle: 2.5,
    });

    expect(segments.map((s) => s.ticker)).toEqual(["B", "C", "A"]);
    expect(segments[0].startAngle).toBeCloseTo(0);
  });

  it("隙間なし（padAngle: 0）のとき、先頭セグメントは12時位置ちょうどから始まる", () => {
    const holdings = [
      makeHolding({ holdingRatio: 60, asset: { name: "B", tickerSymbol: "B", logoUrl: "" } }),
      makeHolding({ holdingRatio: 40, asset: { name: "A", tickerSymbol: "A", logoUrl: "" } }),
    ];

    const segments = buildDonutSegments(holdings, {
      cx: 120,
      cy: 120,
      outerRadius: 108,
      innerRadius: 68,
      padAngle: 0,
    });

    const { x, y } = firstPoint(segments[0].path);
    expect(x).toBeCloseTo(120);
    expect(y).toBeCloseTo(12); // cy - outerRadius = 120 - 108
  });
});

describe("getWheelColorVar", () => {
  it("インデックスに対応するCSS変数名を返す", () => {
    expect(getWheelColorVar(0)).toBe("var(--wheel-1)");
    expect(getWheelColorVar(7)).toBe("var(--wheel-8)");
  });

  it("8を超えるインデックスは循環する", () => {
    expect(getWheelColorVar(8)).toBe("var(--wheel-1)");
  });
});
