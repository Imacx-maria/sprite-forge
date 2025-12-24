"use client";

/**
 * WorldScene — Display component for generated World Scene image
 *
 * Phase 8: Shows the 16:9 landscape World Scene with download capability
 *
 * - Displays 1920x1080 generated scene
 * - No frame overlay needed (scene is complete as-is)
 * - Download button for saving the scene
 */

import { useCallback } from "react";

interface WorldSceneProps {
  /** World Scene image data URL */
  sceneImage: string;
  /** Optional world name for download filename */
  worldName?: string;
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

export function WorldScene({ sceneImage, worldName = "world" }: WorldSceneProps) {
  const handleDownload = useCallback(() => {
    downloadScene(sceneImage, worldName);
  }, [sceneImage, worldName]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scene image container with 16:9 aspect ratio */}
      <div className="relative w-full max-w-4xl overflow-hidden border-4 border-[#333333]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sceneImage}
          alt="Generated World Scene"
          className="h-auto w-full"
          style={{ aspectRatio: "16/9", objectFit: "cover" }}
        />
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="border-4 border-[#444444] bg-[#222222] px-8 py-4 text-2xl tracking-widest text-white transition-colors hover:border-[#666666] hover:bg-[#333333]"
      >
        DOWNLOAD SCENE
      </button>
    </div>
  );
}
