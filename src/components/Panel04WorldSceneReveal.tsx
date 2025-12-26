"use client";

/**
 * Panel 04 — World Scene Reveal
 *
 * Phase 9: First step of the two-step reveal flow
 *
 * Shows ONLY the World Scene image after generation succeeds.
 * User must click CONTINUE to proceed to Player Card reveal.
 *
 * Per spec (user-flow.md, world-scene.md):
 * - Title: "You spawned into the world"
 * - Single action: CONTINUE button
 * - No download buttons (downloads come in Panel 06)
 * - Clean, focused reveal moment
 */

import { useCallback } from "react";
import { usePhoto } from "@/context";
import { getWorld } from "@/lib/worlds";

interface Panel04Props {
  /** Optional world-specific subtitle */
  showSubtitle?: boolean;
}

/**
 * World-specific subtitles per spec (system-messages.md)
 */
const WORLD_SUBTITLES: Record<string, string> = {
  "fantasy-rpg": "A new adventure begins.",
  "street-brawler": "No rules. No mercy.",
  "galactic-overlord": "Your domain awaits.",
  "space-marine": "Mission parameters loaded.",
  "gothic-hunter": "The hunt begins.",
  "candy-land": "Sweet dreams await.",
};

export function Panel04WorldSceneReveal({ showSubtitle = true }: Panel04Props) {
  const {
    generatedWorldScene,
    selectedWorld,
    advanceReveal,
  } = usePhoto();

  const world = getWorld(selectedWorld);
  const subtitle = WORLD_SUBTITLES[selectedWorld] || "";

  const handleContinue = useCallback(() => {
    advanceReveal();
  }, [advanceReveal]);

  // Safety check - should never happen if flow is correct
  if (!generatedWorldScene) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a]">
      <main className="flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 py-8">
        {/* Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl tracking-wider text-white sm:text-4xl md:text-5xl">
            YOU SPAWNED INTO THE WORLD
          </h1>
          {showSubtitle && subtitle && (
            <p className="text-lg tracking-wide text-[#888888]">
              {subtitle}
            </p>
          )}
        </div>

        {/* World Scene - full width, landscape focus */}
        <div className="w-full overflow-hidden border-4 border-[#333333]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={generatedWorldScene}
            alt={`${world.displayName} World Scene`}
            className="h-auto w-full"
            style={{ aspectRatio: "16/9", objectFit: "cover" }}
          />
        </div>

        {/* Single action: CONTINUE */}
        <button
          type="button"
          onClick={handleContinue}
          className="border-4 border-[#444444] bg-[#222222] px-12 py-4 text-2xl tracking-widest text-white transition-colors hover:border-[#666666] hover:bg-[#333333]"
        >
          CONTINUE
        </button>
      </main>

      {/* Version footer */}
      <p className="absolute bottom-8 right-8 text-sm tracking-wide text-[#444444]">
        v1.0.0
      </p>
    </div>
  );
}
