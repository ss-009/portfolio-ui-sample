import "@testing-library/jest-dom/vitest";

// jsdom は IntersectionObserver を実装していないため、未使用テストでも
// コンポーネントのマウント自体は落ちないよう最小限のダミーを用意する。
// 挙動そのものを検証するテストは各テストファイル側で vi.stubGlobal して上書きする。
class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = NoopIntersectionObserver;
}
