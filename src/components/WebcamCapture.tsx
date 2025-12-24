"use client";

/**
 * WebcamCapture — Optional webcam input for photo capture
 *
 * Phase 3: Client-side only
 * Phase 8: Stabilization fixes for reliable capture
 *
 * - Captures photo from device camera
 * - Converts to File object (same as upload)
 * - Uses same resize pipeline as file uploads
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

type CameraState = "idle" | "requesting" | "active" | "processing" | "error";

/**
 * Map common permission/access errors to user-friendly messages
 */
function getUserFriendlyCameraError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Permission denied
    if (
      name === "notallowederror" ||
      message.includes("permission denied") ||
      message.includes("not allowed")
    ) {
      return "Camera access was denied. Please allow camera permissions and try again.";
    }

    // No camera found
    if (
      name === "notfounderror" ||
      message.includes("not found") ||
      message.includes("no video")
    ) {
      return "No camera found. Please connect a camera and try again.";
    }

    // Camera in use
    if (
      name === "notreadableerror" ||
      message.includes("could not start") ||
      message.includes("in use")
    ) {
      return "Camera is in use by another application. Please close other apps and try again.";
    }

    // Security/HTTPS issues
    if (name === "securityerror" || message.includes("secure")) {
      return "Camera access requires a secure connection (HTTPS).";
    }

    return error.message;
  }

  return "Failed to access camera";
}

export function WebcamCapture({ onCapture, onCancel }: WebcamCaptureProps) {
  const { setPhotoFromFile } = usePhoto();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setCameraState("requesting");
    setError(null);
    setIsVideoReady(false);

    try {
      // Check if API is available
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      // Request camera access with flexible constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error("Video element not available");
      }

      // Set up video element
      video.srcObject = stream;

      // Wait for video metadata to load (dimensions become available)
      await new Promise<void>((resolve, reject) => {
        const onLoadedMetadata = () => {
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
          video.removeEventListener("error", onError);
          resolve();
        };

        const onError = () => {
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
          video.removeEventListener("error", onError);
          reject(new Error("Failed to load video stream"));
        };

        // Check if already loaded
        if (video.readyState >= 1) {
          resolve();
          return;
        }

        video.addEventListener("loadedmetadata", onLoadedMetadata);
        video.addEventListener("error", onError);

        // Timeout after 10 seconds
        setTimeout(() => {
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
          video.removeEventListener("error", onError);
          reject(new Error("Camera took too long to start"));
        }, 10000);
      });

      // Start playing
      await video.play();

      // Verify dimensions are available
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Camera stream has no dimensions");
      }

      setIsVideoReady(true);
      setCameraState("active");
    } catch (err) {
      // Clean up stream on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const message = getUserFriendlyCameraError(err);
      setError(message);
      setCameraState("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsVideoReady(false);
    setCameraState("idle");
  }, []);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Validate prerequisites
    if (!video || !canvas) {
      setError("Camera components not available");
      return;
    }

    if (!isVideoReady) {
      setError("Camera is not ready yet");
      return;
    }

    // Validate video has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera stream has no dimensions. Please try again.");
      return;
    }

    setCameraState("processing");
    setError(null);

    try {
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Get canvas context
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not available");
      }

      // Draw the current video frame to canvas
      // Note: We draw normally (not mirrored) so the saved image is correct
      ctx.drawImage(video, 0, 0);

      // Convert canvas to JPEG blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("Failed to capture image from camera");
      }

      // Create File from blob (same format as file uploads)
      const file = new File([blob], `webcam-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // CRITICAL: Use the SAME pipeline as file uploads
      // setPhotoFromFile calls resizeImage internally
      const result = await setPhotoFromFile(file, "webcam");

      if (result.valid) {
        // Success - stop camera and notify parent
        stopCamera();
        onCapture?.();
      } else {
        // Validation/resize failed
        setError(result.error || "Failed to process captured image");
        setCameraState("active");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to capture image";
      setError(message);
      setCameraState("active");
    }
  }, [setPhotoFromFile, stopCamera, onCapture, isVideoReady]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel?.();
  }, [stopCamera, onCancel]);

  const isProcessing = cameraState === "processing";
  const isActive = cameraState === "active" || cameraState === "processing";
  const isRequesting = cameraState === "requesting";
  const canCapture = isVideoReady && !isProcessing;

  // Main render - video element is ALWAYS in DOM (but hidden when not active)
  // This ensures the ref is available when we get the camera stream
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hidden video and canvas elements - MUST be in DOM for refs to work */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={isActive ? "hidden" : "hidden"}
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Idle state */}
      {cameraState === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={startCamera}
            className="text-xl tracking-wide text-[#888888] transition-colors hover:text-white"
          >
            [ USE WEBCAM ]
          </button>
        </div>
      )}

      {/* Requesting permission */}
      {isRequesting && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl tracking-wide text-[#888888]">
            REQUESTING CAMERA ACCESS...
          </p>
          <p className="text-sm tracking-wide text-[#666666]">
            Please allow camera access when prompted
          </p>
          <button
            type="button"
            onClick={handleCancel}
            className="text-lg tracking-wide text-[#666666] transition-colors hover:text-red-500"
          >
            [ CANCEL ]
          </button>
        </div>
      )}

      {/* Error state */}
      {cameraState === "error" && (
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
      )}

      {/* Active camera view - shows live preview for framing the shot */}
      {isActive && (
        <>
          {/* Live preview (like a mirror) */}
          <div
            className={`relative border-4 border-[#666666] ${isProcessing ? "opacity-50" : ""}`}
          >
            {/* We need a VISIBLE video for preview - copy stream to this one */}
            <video
              ref={(el) => {
                // Mirror the stream to this visible video element
                if (el && streamRef.current && !el.srcObject) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className="max-h-80 max-w-full"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Status indicator */}
            <div className="absolute left-2 top-2 flex items-center gap-2">
              <div
                className={`h-3 w-3 animate-pulse rounded-full ${
                  isProcessing
                    ? "bg-yellow-500"
                    : isVideoReady
                      ? "bg-red-500"
                      : "bg-orange-500"
                }`}
              />
              <span
                className={`text-xs uppercase tracking-wider ${
                  isProcessing
                    ? "text-yellow-500"
                    : isVideoReady
                      ? "text-red-500"
                      : "text-orange-500"
                }`}
              >
                {isProcessing ? "TAKING PHOTO" : isVideoReady ? "READY" : "STARTING"}
              </span>
            </div>
          </div>

          {/* Capture controls */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className={`text-lg tracking-wide transition-colors ${
                isProcessing
                  ? "cursor-not-allowed text-[#444444]"
                  : "text-[#666666] hover:text-red-500"
              }`}
            >
              [ CANCEL ]
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!canCapture}
              className={`text-2xl tracking-wide transition-opacity ${
                !canCapture
                  ? "cursor-wait text-[#666666]"
                  : "text-white hover:opacity-70"
              }`}
            >
              {isProcessing
                ? "[ CAPTURING... ]"
                : !isVideoReady
                  ? "[ WAIT ]"
                  : "[ TAKE PHOTO ]"}
            </button>
          </div>

          {error && (
            <p className="text-lg tracking-wide text-red-500" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
