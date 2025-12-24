"use client";

/**
 * PhotoUpload — File picker component for photo input
 *
 * Phase 3: Client-side only
 * - Accepts images via file picker or drag-and-drop
 * - Validates file type and size
 * - Shows error messages on validation failure
 * - Passes valid files to PhotoContext
 */

import { useCallback, useRef, useState, type DragEvent } from "react";
import { usePhoto } from "@/context";
import { PHOTO_CONSTRAINTS } from "@/types/photo";

interface PhotoUploadProps {
  /** Optional callback when upload succeeds */
  onSuccess?: () => void;
}

export function PhotoUpload({ onSuccess }: PhotoUploadProps) {
  const { setPhotoFromFile, photo } = usePhoto();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const result = setPhotoFromFile(file, "upload");

      if (!result.valid && result.error) {
        setError(result.error);
      } else if (result.valid && onSuccess) {
        onSuccess();
      }
    },
    [setPhotoFromFile, onSuccess]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  // If photo already exists, show minimal replacement option
  if (photo) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleClick}
          className="text-lg tracking-wide text-[#888888] transition-colors hover:text-white"
        >
          [ CHOOSE DIFFERENT PHOTO ]
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={PHOTO_CONSTRAINTS.ALLOWED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Choose a different photo"
        />
        {error && (
          <p className="text-lg tracking-wide text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex h-64 w-full max-w-md cursor-pointer flex-col items-center justify-center
          border-4 border-dashed transition-colors
          ${
            isDragging
              ? "border-white bg-white/10"
              : "border-[#444444] hover:border-[#666666]"
          }
        `}
        aria-label="Drop zone for photo upload"
      >
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          {/* Icon placeholder - simple ASCII art */}
          <div className="text-4xl text-[#666666]">[+]</div>

          <p className="text-xl tracking-wide text-[#888888]">
            {isDragging ? "DROP IT!" : "DROP YOUR PHOTO HERE"}
          </p>

          <p className="text-lg tracking-wide text-[#666666]">
            — OR —
          </p>

          <p className="text-xl tracking-wide text-white">
            CLICK TO SELECT
          </p>

          <p className="mt-2 text-sm tracking-wide text-[#444444]">
            {PHOTO_CONSTRAINTS.ALLOWED_EXTENSIONS.join(" / ")} &bull; MAX{" "}
            {PHOTO_CONSTRAINTS.MAX_SIZE_DISPLAY}
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={PHOTO_CONSTRAINTS.ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select a photo file"
      />

      {/* Error message */}
      {error && (
        <p className="text-lg tracking-wide text-red-500" role="alert">
          ERROR: {error}
        </p>
      )}
    </div>
  );
}
