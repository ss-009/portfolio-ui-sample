"use client";

import { useState } from "react";

interface AssetLogoProps {
  src: string;
  alt: string;
  tickerSymbol: string;
  size?: number;
  colorVar: string;
}

/**
 * 銘柄ロゴ画像。取得に失敗した場合はティッカーの頭文字を色付きバッジで代替表示する。
 * ロゴはユーザー管理外の外部SVGのため、next/image の最適化対象にはせず素の <img> で表示する。
 */
export function AssetLogo({ src, alt, tickerSymbol, size = 44, colorVar }: AssetLogoProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    // 背景をチャートの識別色そのものにすると、明るい色（黄色など）の上で白文字が
    // 読めなくなる。常に読める配色（中間色の背景 + 通常の文字色）にし、識別色は
    // リングとして添えるだけに留める。
    return (
      <span
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-(--ink-primary) shadow-sm sm:h-11 sm:w-11 lg:h-12 lg:w-12"
        style={{
          backgroundColor: "var(--surface-muted)",
          border: `2px solid ${colorVar}`,
        }}
        aria-hidden="true"
      >
        {tickerSymbol.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- 外部ドメインのSVGロゴを最適化なしで表示
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      // スマホの狭い幅では一覧の銘柄名にスペースを譲るため、ロゴを一段階小さくする。
      className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-1 shadow-sm ring-1 ring-black/5 sm:h-11 sm:w-11 lg:h-12 lg:w-12"
      onError={() => setErrored(true)}
    />
  );
}
