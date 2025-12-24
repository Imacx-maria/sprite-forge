"use client";

/**
 * WebcamCapture — Optional webcam input for photo capture
 *
 * Phase 3: Client-side only
 * - Captures photo from device camera
 * - Converts to File object (same as upload)
 * - Falls back gracefully if webcam unavailable
 *
 * Note: Uses browser MediaDevices API
 */

import { useCallback, useRef, useState, useEffect } from "react";
import { usePhoto } from "@/context";

interface WebcamCaptureProps {
  /** Callback when capture succeeds */
  onCapture?: () => void;
  /** Callback to close/cancel webcam */
  onCancel?: () => void;
}

type CameraState = "idle" | "requesting" | "active" | "error";

export function WebcamCapture({ onCapture, onCancel }: WebcamCaptureProps) {
  const { setPhotoFromFile } = usePhoto();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    setError(null);

    try {
      // Check if API is available
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("active");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access camera";
      setError(message);
      setCameraState("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("idle");
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to capture image");
          return;
        }

        // Create File from blob
        const file = new File([blob], `webcam-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        // Set photo in context
        const result = setPhotoFromFile(file, "webcam");

        if (result.valid) {
          stopCamera();
          onCapture?.();
        } else if (result.error) {
          setError(result.error);
        }
      },
      "image/jpeg",
      0.9
    );
  }, [setPhotoFromFile, stopCamera, onCapture]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel?.();
  }, [stopCamera, onCancel]);

  // Idle state - show button to start camera
  if (cameraState === "idle") {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={startCamera}
          className="text-xl tracking-wide text-[#888888] transition-colors hover:text-white"
        >
          [ USE WEBCAM ]
        </button>
      </div>
    );
  }

  // Requesting permission
  if (cameraState === "requesting") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-xl tracking-wide text-[#888888]">
          REQUESTING CAMERA ACCESS...
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="text-lg tracking-wide text-[#666666] transition-colors hover:text-red-500"
        >
          [ CANCEL ]
        </button>
      </div>
    );
  }

  // Error state
  if (cameraState === "error") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg tracking-wide text-red-500" role="alert">
          ERROR: {error}
        </p>
        <button
          type="button"
          onClick={() => setCameraState("idle")}
          className="text-lg tracking-wide text-[#888888] transition-colors hover:text-white"
        >
          [ TRY AGAIN ]
        </button>
      </div>
    );
  }

  // Active camera view
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Video preview */}
      <div className="relative border-4 border-[#666666]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="max-h-80 max-w-full"
          style={{ transform: "scaleX(-1)" }} // Mirror for selfie feel
        />
        {/* Recording indicator */}
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="text-xs uppercase tracking-wider text-red-500">
            LIVE
          </span>
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={handleCancel}
          className="text-lg tracking-wide text-[#666666] transition-colors hover:text-red-500"
        >
          [ CANCEL ]
        </button>
        <button
          type="button"
          onClick={capturePhoto}
          className="text-2xl tracking-wide text-white transition-opacity hover:opacity-70"
        >
          [ CAPTURE ]
        </button>
      </div>

      {error && (
        <p className="text-lg tracking-wide text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
