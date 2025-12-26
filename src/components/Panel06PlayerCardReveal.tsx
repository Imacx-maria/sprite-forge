"use client";

/**
 * Panel 06 — Player Card Reveal
 *
 * Phase 9: Final step of the two-step reveal flow
 *
 * Shows the Player Card as the primary reward. Downloads for BOTH
 * outputs become available here.
 *
 * Per spec (user-flow.md, system-messages.md):
 * - Title: "Your player card"
 * - Helper: "This one's yours."
 * - Download buttons for both Player Card and World Scene
 * - Replay actions: "Try another world" / "Upload new character"
 *
 * V2 behavior (V2_MODE_ACTIVE=true):
 * - AI generates complete card (frame + text + stats included)
 * - PlayerCard receives only the image (no characterData, no framePath)
 * - NameInput still shown but doesn't affect the card image
 *
 * V1 behavior (V2_MODE_ACTIVE=false):
 * - PlayerCard composes card locally with frame/text/stats overlays
 * - characterData and framePath are passed to PlayerCard
 */

import { useState, useCallback, useMemo } from "react";
import { usePhoto } from "@/context";
import { useWorlds, getRandomTitleFromSummary } from "@/lib/worlds";
import type { CharacterData } from "@/lib/card";
import { PlayerCard } from "./PlayerCard";
import { NameInput } from "./NameInput";
import { V2_MODE_ACTIVE } from "@/lib/config/v2-flags";

interface Panel06Props {
  /** Callback when user wants to try another world (same photo) */
  onTryAnotherWorld?: () => void;
  /** Callback when user wants to upload new character */
  onUploadNew?: () => void;
}

/**
 * Download the scene image as PNG
 */
function downloadScene(dataUrl: string, worldName: string = "world"): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `sprite-forge-${worldName.toLowerCase().replace(/\s+/g, "-")}-scene.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function Panel06PlayerCardReveal({ onTryAnotherWorld, onUploadNew }: Panel06Props) {
  const {
    generatedCardImage,
    generatedWorldScene,
    selectedWorld,
    playerName,
    playerStats,
    setPlayerName,
    randomizePlayerIdentity,
    generationsUsed,
    generationLimit,
    limitReached,
    clearAllGeneratedImages,
    clearPhoto,
    goToPanel,
  } = usePhoto();
  // Get world data from hook (client-safe)
  const { getWorldById, loading: worldsLoading } = useWorlds();
  const world = getWorldById(selectedWorld);

  // V1 ONLY: Card title (randomly selected from world's titles)
  // In V2, the AI generates the card title directly
  // Using React's recommended pattern: calculate during render instead of useEffect
  const [cardTitle, setCardTitle] = useState(() =>
    world ? getRandomTitleFromSummary(world) : "HERO"
  );
  const [prevWorldId, setPrevWorldId] = useState(world?.id);

  // V1 ONLY: Reset title when world changes (calculated during render)
  if (!V2_MODE_ACTIVE && world && world.id !== prevWorldId) {
    setPrevWorldId(world.id);
    setCardTitle(getRandomTitleFromSummary(world));
  }

  // V1 ONLY: Build character data for card composition
  // In V2, this data is not used (AI generates complete card)
  const characterData: CharacterData | undefined = useMemo(() => {
    if (V2_MODE_ACTIVE) {
      return undefined;
    }
    return {
      cardType: cardTitle,
      name: playerName,
      stats: playerStats,
    };
  }, [cardTitle, playerName, playerStats]);

  // Download world scene
  const handleDownloadScene = useCallback(() => {
    if (generatedWorldScene) {
      downloadScene(generatedWorldScene, world?.displayName ?? "world");
    }
  }, [generatedWorldScene, world?.displayName]);

  // Try another world (same photo)
  const handleTryAnotherWorld = useCallback(() => {
    clearAllGeneratedImages();
    if (onTryAnotherWorld) {
      onTryAnotherWorld();
    }
  }, [clearAllGeneratedImages, onTryAnotherWorld]);

  // Upload new character
  const handleUploadNew = useCallback(() => {
    clearPhoto();
    goToPanel(1);
    if (onUploadNew) {
      onUploadNew();
    }
  }, [clearPhoto, goToPanel, onUploadNew]);

  // Safety check - wait for world data and generated image
  if (!generatedCardImage || worldsLoading || !world) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#0a0a0a]">
      <main className="flex w-full max-w-4xl flex-col items-center gap-8 px-4 py-8">
        {/* Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl tracking-wider text-white sm:text-4xl md:text-5xl">
            YOUR PLAYER CARD
          </h1>
          <p className="text-lg tracking-wide text-[#888888]">
            This one&apos;s yours.
          </p>
        </div>

        {/* Player Card */}
        <div className="w-full max-w-md">
          {V2_MODE_ACTIVE ? (
            // V2: AI-generated complete card (no composition needed)
            <PlayerCard characterImage={generatedCardImage} />
          ) : (
            // V1: Local composition with frame/text/stats overlays
            <PlayerCard
              characterImage={generatedCardImage}
              character={characterData}
            />
          )}
        </div>

        {/* Edit Name/Stats */}
        <div className="w-full max-w-md">
          <NameInput
            name={playerName}
            stats={playerStats}
            onNameChange={setPlayerName}
            onRandomize={randomizePlayerIdentity}
          />
        </div>

        {/* Download World Scene button */}
        {generatedWorldScene && (
          <button
            type="button"
            onClick={handleDownloadScene}
            className="border-4 border-[#444444] bg-[#222222] px-8 py-3 text-xl tracking-widest text-white transition-colors hover:border-[#666666] hover:bg-[#333333]"
          >
            DOWNLOAD SCENE
          </button>
        )}

        {/* Generation count */}
        <p className="text-sm tracking-wide text-[#666666]">
          GENERATIONS: {generationsUsed} / {generationLimit}
        </p>

        {/* Replay section */}
        <div className="flex flex-col items-center gap-2 border-t border-[#333333] pt-6">
          <h2 className="text-xl tracking-wide text-[#888888]">
            WHAT&apos;S NEXT?
          </h2>
          <p className="text-sm tracking-wide text-[#666666]">
            Same rules. New reality.
          </p>
        </div>

        {/* Replay actions */}
        <div className="flex flex-col items-center gap-4">
          {!limitReached && (
            <button
              type="button"
              onClick={handleTryAnotherWorld}
              className="text-xl tracking-widest text-[#888888] transition-colors hover:text-white"
            >
              [ TRY ANOTHER WORLD ]
            </button>
          )}

          <button
            type="button"
            onClick={handleUploadNew}
            className="text-lg tracking-wide text-[#666666] transition-colors hover:text-white"
          >
            Upload new character
          </button>

          {limitReached && (
            <p className="text-sm tracking-wide text-[#666666]">
              Generation limit reached. Refresh to reset.
            </p>
          )}
        </div>
      </main>

      {/* Version footer */}
      <p className="absolute bottom-8 right-8 text-sm tracking-wide text-[#444444]">
        v1.0.0
      </p>
    </div>
  );
}
