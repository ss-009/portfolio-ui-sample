"use client";

import { useEffect, useState, type RefObject } from "react";

interface ScrollToTopButtonProps {
  watchRef: RefObject<HTMLElement | null>;
}

export function ScrollToTopButton({ watchRef }: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = watchRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio < 0.5),
      { threshold: [0, 0.5] },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchRef]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="ページの先頭へ戻る"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-5 bottom-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2 focus-visible:outline-none sm:right-8 sm:bottom-8 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white/40"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
