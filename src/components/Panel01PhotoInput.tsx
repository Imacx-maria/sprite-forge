"use client";

/**
 * Panel 01 — Photo Input Screen
 *
 * Phase 3: Client-side photo input
 * - Upload photo via file picker or drag-and-drop
 * - Optional webcam capture
 * - Preview selected photo
 * - Proceed to next step (stubbed for Phase 4)
 *
 * TODO Phase 4: Add world/style selection before generation
 * TODO Phase 4: Wire up "FORGE IT" button to /api/generate
 */

import { useState, useCallback } from "react";
import { usePhoto } from "@/context";
import { PhotoUpload } from "./PhotoUpload";
import { PhotoPreview } from "./PhotoPreview";
import { WebcamCapture } from "./WebcamCapture";

type InputMode = "upload" | "webcam";

interface Panel01Props {
  /** Callback to go back to title screen */
  onBack?: () => void;
}

export function Panel01PhotoInput({ onBack }: Panel01Props) {
  const { photo, goToPanel, prepareGenerationRequest } = usePhoto();
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [showWebcam, setShowWebcam] = useState(false);

  const handleBack = useCallback(() => {
    goToPanel(0);
    onBack?.();
  }, [goToPanel, onBack]);

  const handleProceed = useCallback(async () => {
    /**
     * TODO Phase 4: Implement generation flow
     *
     * 1. Call prepareGenerationRequest() to get base64 data
     * 2. Show loading/processing state
     * 3. POST to /api/generate with the request
     * 4. Navigate to results panel on success
     * 5. Show error on failure
     *
     * For now, just log and stub the action.
     */
    console.log("[STUB] FORGE IT clicked - Phase 4 will implement generation");

    // Demo: prepare the request structure (does not call API)
    const request = await prepareGenerationRequest();
    console.log("[STUB] Generation request prepared:", request);

    // TODO Phase 4: goToPanel(2) or navigate to results
  }, [prepareGenerationRequest]);

  const handleWebcamCapture = useCallback(() => {
    setShowWebcam(false);
    setInputMode("upload");
  }, []);

  const handleWebcamCancel = useCallback(() => {
    setShowWebcam(false);
  }, []);

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

        {/* Main content area */}
        <div className="flex w-full flex-col items-center gap-8">
          {/* Show webcam if active */}
          {showWebcam ? (
            <WebcamCapture
              onCapture={handleWebcamCapture}
              onCancel={handleWebcamCancel}
            />
          ) : photo ? (
            /* Show preview if photo selected */
            <div className="flex flex-col items-center gap-6">
              <PhotoPreview maxSize={320} showInfo showClear />

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
          {/* Proceed button (only if photo selected) */}
          {photo && !showWebcam && (
            <button
              type="button"
              onClick={handleProceed}
              className="text-3xl tracking-widest text-white transition-opacity hover:opacity-70"
            >
              FORGE IT
            </button>
          )}

          {/* TODO Phase 4 hint */}
          {photo && !showWebcam && (
            <p className="text-sm tracking-wide text-[#444444]">
              {/* TODO Phase 4: World selection will appear here */}
              GENERATION COMING IN PHASE 4
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
          v0.2.0 — PHASE 3
        </p>
      </main>
    </div>
  );
}
