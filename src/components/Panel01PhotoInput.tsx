"use client";

/**
 * Panel 01 — Photo Input, World Selection, Generation & Player Card Screen
 *
 * Phase 5: Complete flow from photo to downloadable Player Card
 * Phase 6: World selection for themed generation
 *
 * - Upload photo via file picker or drag-and-drop
 * - Optional webcam capture
 * - Preview selected photo
 * - Select world theme for generation
 * - Generate pixel-art via OpenRouter API with world modifier
 * - Display generated result as Player Card
 * - Download composed Player Card as PNG
 * - Per-session generation limit
 */

import { useState, useCallback } from "react";
import { usePhoto } from "@/context";
import { PhotoUpload } from "./PhotoUpload";
import { PhotoPreview } from "./PhotoPreview";
import { WebcamCapture } from "./WebcamCapture";
import { PlayerCard } from "./PlayerCard";
import { WorldSelector } from "./WorldSelector";

interface Panel01Props {
  /** Callback to go back to title screen */
  onBack?: () => void;
}

export function Panel01PhotoInput({ onBack }: Panel01Props) {
  const {
    photo,
    goToPanel,
    generatePixelArt,
    isGenerating,
    generatedImage,
    generationError,
    generationsUsed,
    generationLimit,
    limitReached,
    clearGeneratedImage,
    clearGenerationError,
    selectedWorld,
    setSelectedWorld,
  } = usePhoto();
  const [showWebcam, setShowWebcam] = useState(false);

  const handleBack = useCallback(() => {
    goToPanel(0);
    onBack?.();
  }, [goToPanel, onBack]);

  const handleGenerate = useCallback(async () => {
    clearGenerationError();
    await generatePixelArt();
  }, [generatePixelArt, clearGenerationError]);

  const handleTryAgain = useCallback(() => {
    clearGeneratedImage();
    clearGenerationError();
  }, [clearGeneratedImage, clearGenerationError]);

  const handleWebcamCapture = useCallback(() => {
    setShowWebcam(false);
  }, []);

  const handleWebcamCancel = useCallback(() => {
    setShowWebcam(false);
  }, []);

  // Show generated result with Player Card
  if (generatedImage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a]">
        <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-8 py-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-4xl tracking-wider text-white sm:text-5xl">
              YOUR PIXEL LEGEND
            </h1>
            <p className="text-lg tracking-wide text-[#888888]">
              FORGED FROM YOUR PHOTO
            </p>
          </div>

          {/* Player Card with download */}
          <PlayerCard characterImage={generatedImage} />

          {/* Generation count */}
          <p className="text-sm tracking-wide text-[#666666]">
            GENERATIONS: {generationsUsed} / {generationLimit}
          </p>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4">
            {!limitReached && (
              <button
                type="button"
                onClick={handleTryAgain}
                className="text-xl tracking-widest text-[#888888] transition-colors hover:text-white"
              >
                [ TRY AGAIN ]
              </button>
            )}

            <button
              type="button"
              onClick={handleBack}
              className="text-lg tracking-wide text-[#666666] transition-colors hover:text-white"
            >
              START OVER
            </button>
          </div>

          {/* Version footer */}
          <p className="absolute bottom-8 right-8 text-sm tracking-wide text-[#444444]">
            v1.0.0
          </p>
        </main>
      </div>
    );
  }

  // Show loading state
  if (isGenerating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a]">
        <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-12 px-8 py-16">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl tracking-wider text-white sm:text-5xl">
              FORGING...
            </h1>
            <p className="text-lg tracking-wide text-[#888888]">
              TRANSFORMING YOUR PHOTO INTO PIXEL ART
            </p>
          </div>

          {/* Loading animation */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="animate-pulse text-4xl text-white">[ </span>
              <span className="animate-pulse text-4xl text-[#888888]">
                ████████
              </span>
              <span className="animate-pulse text-4xl text-white"> ]</span>
            </div>
            <p className="text-sm tracking-wide text-[#666666]">
              THIS MAY TAKE A MOMENT...
            </p>
          </div>

          {/* Version footer */}
          <p className="absolute bottom-8 right-8 text-sm tracking-wide text-[#444444]">
            v1.0.0
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a]">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center gap-12 px-8 py-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl tracking-wider text-white sm:text-5xl">
            SELECT YOUR PHOTO
          </h1>
          <p className="text-lg tracking-wide text-[#888888]">
            UPLOAD A SELFIE OR USE YOUR WEBCAM
          </p>
        </div>

        {/* Generation error */}
        {generationError && (
          <div className="flex flex-col items-center gap-4 rounded border-2 border-red-500/50 bg-red-500/10 px-6 py-4">
            <p className="text-lg tracking-wide text-red-500" role="alert">
              ERROR: {generationError}
            </p>
            <button
              type="button"
              onClick={clearGenerationError}
              className="text-sm tracking-wide text-[#888888] transition-colors hover:text-white"
            >
              [ DISMISS ]
            </button>
          </div>
        )}

        {/* Main content area */}
        <div className="flex w-full flex-col items-center gap-8">
          {/* Show webcam if active */}
          {showWebcam ? (
            <WebcamCapture
              onCapture={handleWebcamCapture}
              onCancel={handleWebcamCancel}
            />
          ) : photo ? (
            /* Show preview and world selection if photo selected */
            <div className="flex flex-col items-center gap-8">
              <PhotoPreview maxSize={320} showInfo showClear />

              {/* World Selection */}
              <WorldSelector
                selectedWorldId={selectedWorld}
                onWorldChange={setSelectedWorld}
                disabled={isGenerating}
              />

              {/* Mode switch when photo exists */}
              <div className="flex items-center gap-6 text-sm text-[#666666]">
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="tracking-wide transition-colors hover:text-white"
                >
                  USE WEBCAM INSTEAD
                </button>
              </div>
            </div>
          ) : (
            /* Show upload interface */
            <div className="flex w-full flex-col items-center gap-8">
              {/* Upload component */}
              <PhotoUpload />

              {/* Divider */}
              <div className="flex w-full max-w-md items-center gap-4">
                <div className="h-px flex-1 bg-[#333333]" />
                <span className="text-lg tracking-wide text-[#666666]">OR</span>
                <div className="h-px flex-1 bg-[#333333]" />
              </div>

              {/* Webcam option */}
              <button
                type="button"
                onClick={() => setShowWebcam(true)}
                className="text-xl tracking-wide text-[#888888] transition-colors hover:text-white"
              >
                [ USE WEBCAM ]
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-6">
          {/* Generate button (only if photo selected and not at limit) */}
          {photo && !showWebcam && !limitReached && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="text-3xl tracking-widest text-white transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              FORGE IT
            </button>
          )}

          {/* Limit reached message */}
          {photo && !showWebcam && limitReached && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xl tracking-wide text-[#888888]">
                GENERATION LIMIT REACHED
              </p>
              <p className="text-sm tracking-wide text-[#666666]">
                REFRESH THE PAGE TO RESET ({generationLimit} PER SESSION)
              </p>
            </div>
          )}

          {/* Generation counter */}
          {photo && !showWebcam && (
            <p className="text-sm tracking-wide text-[#444444]">
              GENERATIONS: {generationsUsed} / {generationLimit}
            </p>
          )}
        </div>

        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="absolute bottom-8 left-8 text-lg tracking-wide text-[#666666] transition-colors hover:text-white"
        >
          &lt; BACK
        </button>

        {/* Version footer */}
        <p className="absolute bottom-8 right-8 text-sm tracking-wide text-[#444444]">
          v1.0.0
        </p>
      </main>
    </div>
  );
}
