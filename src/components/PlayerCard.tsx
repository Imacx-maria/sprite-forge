"use client";

/**
 * PlayerCard — Displays and enables download of the composed Player Card
 *
 * Phase 5: Card composition and download
 * - Composes card from generated image
 * - Displays preview of the card
 * - Enables PNG download
 * - No persistence
 */

import { useState, useEffect, useCallback } from "react";
import {
  composePlayerCard,
  downloadCard,
  CARD_DIMENSIONS,
  DEFAULT_CHARACTER,
  type CharacterData,
} from "@/lib/card";

interface PlayerCardProps {
  /** Generated character image (data URL) */
  characterImage: string;
  /** Optional character data for overlays */
  character?: CharacterData;
  /** Callback when card is ready */
  onCardReady?: (cardDataUrl: string) => void;
}

type CardState = "idle" | "composing" | "ready" | "error";

export function PlayerCard({
  characterImage,
  character = DEFAULT_CHARACTER,
  onCardReady,
}: PlayerCardProps) {
  const [cardState, setCardState] = useState<CardState>("idle");
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compose card when character image changes
  useEffect(() => {
    // Only compose if we have an image
    if (!characterImage) {
      return;
    }

    let cancelled = false;

    async function compose() {
      setCardState("composing");
      setError(null);

      try {
        const dataUrl = await composePlayerCard(characterImage, character);

        if (!cancelled) {
          setCardDataUrl(dataUrl);
          setCardState("ready");
          onCardReady?.(dataUrl);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to compose card";
          setError(message);
          setCardState("error");
        }
      }
    }

    compose();

    return () => {
      cancelled = true;
    };
  }, [characterImage, character, onCardReady]);

  const handleDownload = useCallback(() => {
    if (cardDataUrl) {
      const timestamp = Date.now();
      downloadCard(cardDataUrl, `sprite-forge-card-${timestamp}.png`);
    }
  }, [cardDataUrl]);

  // If no character image, show idle state directly
  if (!characterImage) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-64 w-48 items-center justify-center border-4 border-dashed border-[#333333]">
          <p className="text-lg tracking-wide text-[#444444]">NO CARD</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (cardState === "composing") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-64 w-48 items-center justify-center border-4 border-dashed border-[#444444]">
          <p className="animate-pulse text-lg tracking-wide text-[#888888]">
            COMPOSING...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (cardState === "error") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-64 w-48 items-center justify-center border-4 border-red-500/50 bg-red-500/10">
          <p className="px-4 text-center text-lg tracking-wide text-red-500">
            {error || "CARD ERROR"}
          </p>
        </div>
      </div>
    );
  }

  // Ready state - show card preview and download button
  if (cardState === "ready" && cardDataUrl) {
    // Calculate preview size (maintain aspect ratio)
    const previewHeight = 352; // Fixed preview height
    const previewWidth = Math.round(
      previewHeight * (CARD_DIMENSIONS.WIDTH / CARD_DIMENSIONS.HEIGHT)
    );

    return (
      <div className="flex flex-col items-center gap-6">
        {/* Card preview */}
        <div className="border-4 border-[#666666] bg-[#111111] p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardDataUrl}
            alt="Your Player Card"
            width={previewWidth}
            height={previewHeight}
            className="block"
            style={{ imageRendering: "auto" }}
          />
        </div>

        {/* Card info */}
        <p className="text-sm tracking-wide text-[#666666]">
          {CARD_DIMENSIONS.WIDTH} x {CARD_DIMENSIONS.HEIGHT} px
        </p>

        {/* Download button */}
        <button
          type="button"
          onClick={handleDownload}
          className="border-4 border-[#444444] bg-[#222222] px-8 py-4 text-2xl tracking-widest text-white transition-colors hover:border-[#666666] hover:bg-[#333333]"
        >
          DOWNLOAD CARD
        </button>
      </div>
    );
  }

  // Composing or idle state - show composing indicator
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-64 w-48 items-center justify-center border-4 border-dashed border-[#444444]">
        <p className="animate-pulse text-lg tracking-wide text-[#888888]">
          COMPOSING...
        </p>
      </div>
    </div>
  );
}
