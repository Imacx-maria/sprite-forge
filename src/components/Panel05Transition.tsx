"use client";

/**
 * Panel 05 — Transition
 *
 * Phase 9: Brief transition between World Scene and Player Card reveals
 *
 * Per spec (05-transition.md):
 * - Dark/near-black "system reconfiguring" feel
 * - Subtle pixel effects (scanlines, noise)
 * - Auto-advance after ~1.5 seconds OR skip on click
 * - Creates emotional separation between reveals
 */

import { useEffect } from "react";
import { usePhoto } from "@/context";

interface Panel05Props {
  /** Duration before auto-advance (ms) */
  duration?: number;
}

export function Panel05Transition({ duration = 1500 }: Panel05Props) {
  const { advanceReveal } = usePhoto();

  // Auto-advance after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      advanceReveal();
    }, duration);

    return () => clearTimeout(timer);
  }, [advanceReveal, duration]);

  // Skip on click
  const handleClick = () => {
    advanceReveal();
  };

  return (
    <div
      className="flex min-h-screen cursor-pointer flex-col items-center justify-center bg-[#0a0a0a]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {/* Scanline overlay effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          )`,
        }}
      />

      {/* Subtle pulsing blocks */}
      <div className="flex items-center gap-2">
        <span className="animate-pulse text-4xl text-[#333333]">█</span>
        <span
          className="animate-pulse text-4xl text-[#444444]"
          style={{ animationDelay: "150ms" }}
        >
          █
        </span>
        <span
          className="animate-pulse text-4xl text-[#333333]"
          style={{ animationDelay: "300ms" }}
        >
          █
        </span>
      </div>

      {/* Version footer */}
      <p className="absolute bottom-8 right-8 text-sm tracking-wide text-[#444444]">
        v1.0.0
      </p>
    </div>
  );
}
