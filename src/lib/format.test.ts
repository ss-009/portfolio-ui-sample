import { describe, expect, it } from "vitest";
import {
  formatPercent,
  formatSignedPercent,
  formatSignedYen,
  formatYen,
  getGainTone,
} from "@/lib/format";

describe("formatYen", () => {
  it("カンマ区切りの円表記になる", () => {
    expect(formatYen(115500)).toBe("¥115,500");
  });

  it("0円を表示できる", () => {
    expect(formatYen(0)).toBe("¥0");
  });
});

describe("formatSignedYen", () => {
  it("正の値には + を付ける", () => {
    expect(formatSignedYen(15500)).toBe("+¥15,500");
  });

  it("負の値には - を付ける（絶対値をカンマ区切りで表示）", () => {
    expect(formatSignedYen(-339)).toBe("-¥339");
  });

  it("ゼロには符号を付けない", () => {
    expect(formatSignedYen(0)).toBe("¥0");
  });
});

describe("formatSignedPercent", () => {
  it("正の値には + を付け、小数第2位まで表示する", () => {
    expect(formatSignedPercent(12.87)).toBe("+12.87%");
  });

  it("負の値には - を付ける", () => {
    expect(formatSignedPercent(-2.8)).toBe("-2.80%");
  });

  it("ゼロには符号を付けない", () => {
    expect(formatSignedPercent(0)).toBe("0.00%");
  });
});

describe("formatPercent", () => {
  it("符号なしで小数第1位まで表示する（保有比率など）", () => {
    expect(formatPercent(39.8)).toBe("39.8%");
  });
});

describe("getGainTone", () => {
  it("正の値は positive", () => {
    expect(getGainTone(5242)).toBe("positive");
  });

  it("負の値は negative", () => {
    expect(getGainTone(-339)).toBe("negative");
  });

  it("ゼロは neutral", () => {
    expect(getGainTone(0)).toBe("neutral");
  });
});
