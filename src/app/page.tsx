"use client";

/**
 * Panel 00 — Title / Attract Screen
 *
 * Purpose: Introduce SPRITE FORGE as a game-like machine
 * - Sets tone and establishes genre
 * - Invites entry
 * - Static composition, no animations (optional subtle flicker later)
 *
 * This is a SKELETON implementation.
 * No business logic, no navigation, no state.
 */

export default function Panel00() {
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

        {/* CTA Button - STUB: Does nothing */}
        <button
          type="button"
          onClick={() => {
            // TODO: Phase 3 - Navigate to Panel 01 (World Select)
            console.log("[STUB] PRESS START clicked - no action");
          }}
          className="text-3xl tracking-widest text-white transition-opacity hover:opacity-70 sm:text-4xl"
        >
          PRESS START
        </button>

        {/* Footer hint */}
        <p className="absolute bottom-8 text-sm tracking-wide text-[#444444]">
          v0.1.0 — PHASE 2 SKELETON
        </p>
      </main>
    </div>
  );
}
