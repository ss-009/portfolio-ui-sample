"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * `contentRef` を付けた要素を、`containerRef` を付けた枠の幅に収まるよう
 * transform: scale() で縮小する。
 *
 * 枠（containerRef）と縮小対象（contentRef）を別要素にするのがポイント。
 * 縮小対象自身に max-width を掛けると、はみ出した文字だけが枠外に出て
 * 背景色やパディングは max-width の幅のまま止まってしまう（scale をかけても
 * 比率は変わらないため直らない）。文字も背景も自然なサイズのまま一体で
 * 縮小することで、この崩れを防ぐ。
 */
export function useShrinkToFit<C extends HTMLElement, T extends HTMLElement>(deps: unknown[]) {
  const containerRef = useRef<C>(null);
  const contentRef = useRef<T>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // 縮小した状態のままだと正しく測れないので、一旦等倍に戻してから測る。
    content.style.transform = "scale(1)";
    const availableWidth = container.clientWidth;
    const naturalWidth = content.scrollWidth;

    setScale(
      availableWidth > 0 && naturalWidth > availableWidth ? availableWidth / naturalWidth : 1,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, contentRef, scale };
}
