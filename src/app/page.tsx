"use client";

/**
 * SPRITE FORGE — Main Application
 *
 * V1.0 Launch Ready
 * - Panel 00: Title / Attract Screen
 * - Panel 01: Photo Input, World Selection, Generation, Player Card & Download
 *
 * Navigation handled via PhotoContext state.
 * All data is held in memory only (no persistence).
 * Cards are composed in-memory and downloaded directly.
 */

import { useCallback } from "react";
import { PhotoProvider, usePhoto } from "@/context";
import { AccessGate, Panel01PhotoInput } from "@/components";

/**
 * Panel 00 — Title / Attract Screen
 */
function Panel00TitleScreen() {
  const { goToPanel } = usePhoto();

  const handleStart = useCallback(() => {
    goToPanel(1);
  }, [goToPanel]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Main content container - 16:9 aspect ratio target */}
      <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-16 px-8 py-16">
        {/* Title Block */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* SPRITE FORGE Wordmark */}
          <h1 className="text-6xl tracking-wider text-white sm:text-7xl md:text-8xl">
            SPRITE FORGE
          </h1>

          {/* Tagline */}
          <p className="text-xl tracking-wide text-[#888888] sm:text-2xl">
            TURN YOUR SELFIES INTO PIXEL LEGENDS
          </p>
        </div>

        {/* Spacer */}
        <div className="h-16" />

        {/* CTA Button - Navigates to Panel 01 */}
        <button
          type="button"
          onClick={handleStart}
          className="text-3xl tracking-widest text-white transition-opacity hover:opacity-70 sm:text-4xl"
        >
          PRESS START
        </button>

        {/* Footer hint */}
        <p className="absolute bottom-8 text-sm tracking-wide text-[#444444]">
          v1.0.0
        </p>
      </main>
    </div>
  );
}

/**
 * Panel Router — Renders current panel based on context state
 */
function PanelRouter() {
  const { currentPanel } = usePhoto();

  switch (currentPanel) {
    case 0:
      return <Panel00TitleScreen />;
    case 1:
      return <Panel01PhotoInput />;
    default:
      return <Panel00TitleScreen />;
  }
}

/**
 * Main App Entry Point
 *
 * Wraps application with PhotoProvider for state management.
 * All photo data is client-side only, held in memory.
 *
 * AccessGate: Phase 0 password protection. Remove in Phase 1.
 */
export default function SpriteForgeApp() {
  return (
    <AccessGate>
      <PhotoProvider>
        <PanelRouter />
      </PhotoProvider>
    </AccessGate>
  );
}
