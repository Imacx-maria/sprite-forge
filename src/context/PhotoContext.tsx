"use client";

/**
 * PhotoContext — Client-side Photo & Generation State Management
 *
 * Phase 4: Manages photo data and generation in memory only.
 * Phase 6: World selection for prompt variation
 * Phase 8: Dual-output generation (Player Card + World Scene)
 *
 * - No persistence (localStorage, cookies, etc.)
 * - No server-side storage
 * - Data lost on page refresh (by design)
 * - Per-session generation limit for cost protection
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  PhotoData,
  PhotoSource,
  PhotoValidationResult,
} from "@/types/photo";
import { PHOTO_CONSTRAINTS } from "@/types/photo";
import { DEFAULT_WORLD_ID, getWorld, type WorldId } from "@/lib/worlds";
import { resizeImage } from "@/lib/image";

/**
 * Single image generation result
 */
interface SingleImageResult {
  success: boolean;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Dual-output generation result from the API (Phase 8)
 */
interface DualGenerationResult {
  success: boolean;
  cardImage?: SingleImageResult;
  worldSceneImage?: SingleImageResult;
  error?: string;
  errorCode?: string;
}

/**
 * Legacy generation result (kept for backwards compatibility)
 */
interface GenerationResult {
  success: boolean;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Map backend error codes to user-friendly messages
 */
function getUserFriendlyError(errorCode?: string, fallbackMessage?: string): string {
  const errorMessages: Record<string, string> = {
    MODEL_RETURNED_TEXT: "Couldn't generate an image. Please try again.",
    GENERATION_FAILED: "Image generation failed. Try another photo.",
    API_ERROR: "Service temporarily unavailable.",
    TIMEOUT: "Request timed out. Please try again.",
    RATE_LIMIT: "Too many requests. Please wait a moment.",
    MISSING_API_KEY: "Service is not configured.",
    INVALID_REQUEST: "Invalid request. Please try again.",
  };

  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode];
  }

  return fallbackMessage || "An unexpected error occurred. Please try again.";
}

/**
 * Per-session generation limit
 */
const SESSION_GENERATION_LIMIT = 5;

/**
 * Context state shape
 */
interface PhotoContextState {
  /** Current photo data (null if no photo selected) */
  photo: PhotoData | null;
  /** Source of current photo */
  source: PhotoSource | null;
  /** Loading state for async operations */
  isLoading: boolean;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Current panel/step in the flow */
  currentPanel: number;
  /** Generated image data URL (null if not generated) - LEGACY */
  generatedImage: string | null;
  /** Generated Player Card image data URL (Phase 8) */
  generatedCardImage: string | null;
  /** Generated World Scene image data URL (Phase 8) */
  generatedWorldScene: string | null;
  /** Generation error message */
  generationError: string | null;
  /** Player Card generation error (Phase 8) */
  cardError: string | null;
  /** World Scene generation error (Phase 8) */
  sceneError: string | null;
  /** Number of generations used this session */
  generationsUsed: number;
  /** Maximum generations per session */
  generationLimit: number;
  /** Whether limit has been reached */
  limitReached: boolean;
  /** Currently selected world for generation */
  selectedWorld: WorldId;
}

/**
 * Context actions
 */
interface PhotoContextActions {
  /** Set photo from file input (async - resizes image first) */
  setPhotoFromFile: (file: File, source: PhotoSource) => Promise<PhotoValidationResult>;
  /** Clear current photo */
  clearPhoto: () => void;
  /** Navigate to a panel */
  goToPanel: (panel: number) => void;
  /** Validate a file before setting */
  validateFile: (file: File) => PhotoValidationResult;
  /** Generate pixel art from current photo (dual-output in Phase 8) */
  generatePixelArt: () => Promise<DualGenerationResult>;
  /** Clear generated image (legacy) */
  clearGeneratedImage: () => void;
  /** Clear all generated images (Phase 8) */
  clearAllGeneratedImages: () => void;
  /** Reset generation error */
  clearGenerationError: () => void;
  /** Set the selected world */
  setSelectedWorld: (worldId: WorldId) => void;
}

type PhotoContextValue = PhotoContextState & PhotoContextActions;

const PhotoContext = createContext<PhotoContextValue | null>(null);

/**
 * Validate file against constraints
 */
function validatePhotoFile(file: File): PhotoValidationResult {
  // Check file type
  if (
    !PHOTO_CONSTRAINTS.ALLOWED_TYPES.includes(
      file.type as (typeof PHOTO_CONSTRAINTS.ALLOWED_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${PHOTO_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > PHOTO_CONSTRAINTS.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum: ${PHOTO_CONSTRAINTS.MAX_SIZE_DISPLAY}`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

/**
 * Convert File to base64 string (without data URL prefix)
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * PhotoProvider — Wraps app with photo and generation state
 */
export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [source, setSource] = useState<PhotoSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  // Phase 8: Dual-output state
  const [generatedCardImage, setGeneratedCardImage] = useState<string | null>(null);
  const [generatedWorldScene, setGeneratedWorldScene] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [selectedWorld, setSelectedWorldState] = useState<WorldId>(DEFAULT_WORLD_ID);

  // Use ref to track generations to avoid stale closure issues
  const generationsRef = useRef(0);

  const limitReached = generationsUsed >= SESSION_GENERATION_LIMIT;

  // Cleanup object URL on unmount or when photo changes
  useEffect(() => {
    return () => {
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, [photo]);

  const validateFile = useCallback((file: File): PhotoValidationResult => {
    return validatePhotoFile(file);
  }, []);

  const setPhotoFromFile = useCallback(
    async (file: File, photoSource: PhotoSource): Promise<PhotoValidationResult> => {
      // Validate file type first (before resize)
      if (
        !PHOTO_CONSTRAINTS.ALLOWED_TYPES.includes(
          file.type as (typeof PHOTO_CONSTRAINTS.ALLOWED_TYPES)[number]
        )
      ) {
        return {
          valid: false,
          error: `Invalid file type. Allowed: ${PHOTO_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ")}`,
        };
      }

      // Check if file is empty
      if (file.size === 0) {
        return {
          valid: false,
          error: "File is empty",
        };
      }

      // Resize image to prevent oversized uploads
      const resizeResult = await resizeImage(file);

      if (!resizeResult.success) {
        return {
          valid: false,
          error: resizeResult.error,
        };
      }

      const processedFile = resizeResult.file;

      // Validate size after resize (should always pass now)
      if (processedFile.size > PHOTO_CONSTRAINTS.MAX_SIZE_BYTES) {
        return {
          valid: false,
          error: `File too large. Maximum: ${PHOTO_CONSTRAINTS.MAX_SIZE_DISPLAY}`,
        };
      }

      // Revoke previous URL if exists
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      // Create object URL for preview (memory only)
      const previewUrl = URL.createObjectURL(processedFile);

      // Set photo data with resized file
      const photoData: PhotoData = {
        file: processedFile,
        previewUrl,
        name: processedFile.name,
        size: processedFile.size,
        type: processedFile.type,
        addedAt: Date.now(),
      };

      setPhoto(photoData);
      setSource(photoSource);
      // Clear any previous generation when new photo is selected
      setGeneratedImage(null);
      setGeneratedCardImage(null);
      setGeneratedWorldScene(null);
      setGenerationError(null);
      setCardError(null);
      setSceneError(null);

      return { valid: true };
    },
    [photo]
  );

  const clearPhoto = useCallback(() => {
    if (photo?.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    setPhoto(null);
    setSource(null);
    setGeneratedImage(null);
    setGeneratedCardImage(null);
    setGeneratedWorldScene(null);
    setGenerationError(null);
    setCardError(null);
    setSceneError(null);
  }, [photo]);

  const goToPanel = useCallback((panel: number) => {
    setCurrentPanel(panel);
  }, []);

  const clearGeneratedImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  const clearAllGeneratedImages = useCallback(() => {
    setGeneratedImage(null);
    setGeneratedCardImage(null);
    setGeneratedWorldScene(null);
    setCardError(null);
    setSceneError(null);
  }, []);

  const clearGenerationError = useCallback(() => {
    setGenerationError(null);
    setCardError(null);
    setSceneError(null);
  }, []);

  const setSelectedWorld = useCallback((worldId: WorldId) => {
    setSelectedWorldState(worldId);
    // Clear generated images when world changes
    setGeneratedImage(null);
    setGeneratedCardImage(null);
    setGeneratedWorldScene(null);
    setCardError(null);
    setSceneError(null);
  }, []);

  /**
   * Generate pixel art from the current photo
   * Phase 8: Calls dual-output API for both Player Card and World Scene
   */
  const generatePixelArt = useCallback(async (): Promise<DualGenerationResult> => {
    // Check if photo exists
    if (!photo) {
      return {
        success: false,
        error: "No photo selected",
        errorCode: "INVALID_REQUEST",
      };
    }

    // Check generation limit
    if (generationsRef.current >= SESSION_GENERATION_LIMIT) {
      return {
        success: false,
        error: `Generation limit reached (${SESSION_GENERATION_LIMIT} per session). Refresh the page to reset.`,
        errorCode: "RATE_LIMIT",
      };
    }

    setIsGenerating(true);
    setGenerationError(null);
    setCardError(null);
    setSceneError(null);

    try {
      // Convert file to base64
      const imageBase64 = await fileToBase64(photo.file);

      // Call the generate API with worldId for dual-output (Phase 8)
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: imageBase64,
          mimeType: photo.type,
          worldId: selectedWorld,
        }),
      });

      // Parse response body
      let result: DualGenerationResult;
      try {
        result = await response.json();
      } catch {
        // Non-JSON response - treat as server error
        const errorMessage = getUserFriendlyError("API_ERROR");
        setGenerationError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorCode: "API_ERROR",
        };
      }

      // Check for success (at least one image generated)
      if (response.ok && result.success) {
        // Increment generation count
        generationsRef.current += 1;
        setGenerationsUsed(generationsRef.current);

        // Process Player Card image
        if (result.cardImage?.success && result.cardImage.imageBase64 && result.cardImage.mimeType) {
          const cardDataUrl = `data:${result.cardImage.mimeType};base64,${result.cardImage.imageBase64}`;
          setGeneratedCardImage(cardDataUrl);
          // Also set legacy field for backwards compatibility
          setGeneratedImage(cardDataUrl);
        } else if (result.cardImage?.error) {
          const cardErrorMsg = getUserFriendlyError(result.cardImage.errorCode, result.cardImage.error);
          setCardError(cardErrorMsg);
        }

        // Process World Scene image
        if (result.worldSceneImage?.success && result.worldSceneImage.imageBase64 && result.worldSceneImage.mimeType) {
          const sceneDataUrl = `data:${result.worldSceneImage.mimeType};base64,${result.worldSceneImage.imageBase64}`;
          setGeneratedWorldScene(sceneDataUrl);
        } else if (result.worldSceneImage?.error) {
          const sceneErrorMsg = getUserFriendlyError(result.worldSceneImage.errorCode, result.worldSceneImage.error);
          setSceneError(sceneErrorMsg);
        }

        return result;
      }

      // Handle error responses (both HTTP errors and success: false)
      const userMessage = getUserFriendlyError(result.errorCode, result.error);
      setGenerationError(userMessage);
      return {
        ...result,
        error: userMessage,
      };
    } catch (error) {
      // Network error or other exception
      const errorMessage = getUserFriendlyError(
        "UNKNOWN",
        error instanceof Error ? error.message : undefined
      );
      setGenerationError(errorMessage);

      return {
        success: false,
        error: errorMessage,
        errorCode: "UNKNOWN",
      };
    } finally {
      setIsGenerating(false);
    }
  }, [photo, selectedWorld]);

  const value: PhotoContextValue = {
    // State
    photo,
    source,
    isLoading,
    isGenerating,
    currentPanel,
    generatedImage,
    generatedCardImage,
    generatedWorldScene,
    generationError,
    cardError,
    sceneError,
    generationsUsed,
    generationLimit: SESSION_GENERATION_LIMIT,
    limitReached,
    selectedWorld,
    // Actions
    setPhotoFromFile,
    clearPhoto,
    goToPanel,
    validateFile,
    generatePixelArt,
    clearGeneratedImage,
    clearAllGeneratedImages,
    clearGenerationError,
    setSelectedWorld,
  };

  return (
    <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>
  );
}

/**
 * Hook to access photo context
 */
export function usePhoto(): PhotoContextValue {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhoto must be used within a PhotoProvider");
  }
  return context;
}
