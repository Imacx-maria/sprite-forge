"use client";

/**
 * PlayerCard — Displays and enables download of the composed Player Card
 *
 * Phase 5: Card composition and download
 * Phase 8: Static frame assets per world
 * V2: Direct rendering of AI-generated complete card
 *
 * V1 behavior (V2_MODE_ACTIVE=false):
 * - Composes card from generated image via composePlayerCard()
 * - Applies local frame/text/stats overlays
 *
 * V2 behavior (V2_MODE_ACTIVE=true):
 * - AI generates complete card (frame + text + stats included)
 * - Renders AI output directly, no local composition
 *
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
import { V2_MODE_ACTIVE } from "@/lib/config/v2-flags";

interface PlayerCardProps {
  /** Generated character image (data URL) */
  characterImage: string;
  /** Optional character data for overlays (V1 only) */
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

  // V2: Bypass composition — AI already generated complete card
  // V1: Compose card with local frame/text/stats overlays
  useEffect(() => {
    // Only process if we have an image
    if (!characterImage) {
      return;
    }

    let cancelled = false;

    async function processCard() {
      setCardState("composing");
      setError(null);

      try {
        let dataUrl: string;

        if (V2_MODE_ACTIVE) {
          // V2: Use AI-generated image directly (no local composition)
          // The AI has already rendered frame, text, and stats
          dataUrl = characterImage;
        } else {
          // V1: Compose card locally with frame/text/stats overlays
          dataUrl = await composePlayerCard(characterImage, character);
        }

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

    processCard();

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
