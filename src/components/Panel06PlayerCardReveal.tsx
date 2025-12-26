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
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePhoto } from "@/context";
import { getWorld, getRandomCardTitle } from "@/lib/worlds";
import type { CharacterData } from "@/lib/card";
import { PlayerCard } from "./PlayerCard";
import { NameInput } from "./NameInput";

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

  const world = getWorld(selectedWorld);

  // Card title (randomly selected from world's cardTitles)
  const [cardTitle, setCardTitle] = useState(() => getRandomCardTitle(world));

  // Regenerate card title when world changes
  useEffect(() => {
    setCardTitle(getRandomCardTitle(world));
  }, [world]);

  // Build character data for card
  const characterData: CharacterData = useMemo(() => ({
    cardType: cardTitle,
    name: playerName,
    stats: playerStats,
  }), [cardTitle, playerName, playerStats]);

  // Download world scene
  const handleDownloadScene = useCallback(() => {
    if (generatedWorldScene) {
      downloadScene(generatedWorldScene, world.displayName);
    }
  }, [generatedWorldScene, world.displayName]);

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

  // Safety check
  if (!generatedCardImage) {
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
          <PlayerCard
            characterImage={generatedCardImage}
            character={characterData}
            framePath={world.framePath}
          />
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
