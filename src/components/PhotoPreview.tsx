"use client";

/**
 * PhotoPreview — Displays the selected photo with clear preview
 *
 * Phase 3: Client-side only
 * - Shows the selected image from memory (Object URL)
 * - Displays file info (name, size)
 * - Provides clear/remove option
 * - Responsive sizing
 */

import { useCallback } from "react";
import { usePhoto } from "@/context";

interface PhotoPreviewProps {
  /** Maximum width/height for the preview container */
  maxSize?: number;
  /** Show file info below the image */
  showInfo?: boolean;
  /** Show clear button */
  showClear?: boolean;
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PhotoPreview({
  maxSize = 320,
  showInfo = true,
  showClear = true,
}: PhotoPreviewProps) {
  const { photo, source, clearPhoto } = usePhoto();

  const handleClear = useCallback(() => {
    clearPhoto();
  }, [clearPhoto]);

  // No photo selected
  if (!photo) {
    return (
      <div
        className="flex items-center justify-center border-4 border-dashed border-[#333333]"
        style={{ width: maxSize, height: maxSize }}
      >
        <p className="text-lg tracking-wide text-[#444444]">NO PHOTO</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image container with border */}
      <div
        className="relative flex items-center justify-center border-4 border-[#666666] bg-[#111111]"
        style={{ maxWidth: maxSize, maxHeight: maxSize }}
      >
        {/* The image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.previewUrl}
          alt={`Preview of ${photo.name}`}
          className="max-h-full max-w-full object-contain"
          style={{ maxWidth: maxSize - 8, maxHeight: maxSize - 8 }}
        />

        {/* Source badge */}
        <div className="absolute right-2 top-2 bg-[#0a0a0a]/80 px-2 py-1 text-xs uppercase tracking-wider text-[#888888]">
          {source === "webcam" ? "WEBCAM" : "UPLOAD"}
        </div>
      </div>

      {/* File info */}
      {showInfo && (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="max-w-xs truncate text-lg tracking-wide text-white">
            {photo.name}
          </p>
          <p className="text-sm tracking-wide text-[#666666]">
            {formatFileSize(photo.size)} &bull; {photo.type.split("/")[1]?.toUpperCase()}
          </p>
        </div>
      )}

      {/* Clear button */}
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="text-lg tracking-wide text-[#666666] transition-colors hover:text-red-500"
        >
          [ REMOVE ]
        </button>
      )}
    </div>
  );
}
