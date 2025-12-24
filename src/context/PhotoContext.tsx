"use client";

/**
 * PhotoContext — Client-side Photo & Generation State Management
 *
 * Phase 4: Manages photo data and generation in memory only.
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

/**
 * Generation result from the API
 */
interface GenerationResult {
  success: boolean;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
  errorCode?: string;
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
  /** Generated image data URL (null if not generated) */
  generatedImage: string | null;
  /** Generation error message */
  generationError: string | null;
  /** Number of generations used this session */
  generationsUsed: number;
  /** Maximum generations per session */
  generationLimit: number;
  /** Whether limit has been reached */
  limitReached: boolean;
}

/**
 * Context actions
 */
interface PhotoContextActions {
  /** Set photo from file input */
  setPhotoFromFile: (file: File, source: PhotoSource) => PhotoValidationResult;
  /** Clear current photo */
  clearPhoto: () => void;
  /** Navigate to a panel */
  goToPanel: (panel: number) => void;
  /** Validate a file before setting */
  validateFile: (file: File) => PhotoValidationResult;
  /** Generate pixel art from current photo */
  generatePixelArt: () => Promise<GenerationResult>;
  /** Clear generated image */
  clearGeneratedImage: () => void;
  /** Reset generation error */
  clearGenerationError: () => void;
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
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationsUsed, setGenerationsUsed] = useState(0);

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
    (file: File, photoSource: PhotoSource): PhotoValidationResult => {
      // Validate first
      const validation = validatePhotoFile(file);
      if (!validation.valid) {
        return validation;
      }

      // Revoke previous URL if exists
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      // Create object URL for preview (memory only)
      const previewUrl = URL.createObjectURL(file);

      // Set photo data
      const photoData: PhotoData = {
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        addedAt: Date.now(),
      };

      setPhoto(photoData);
      setSource(photoSource);
      // Clear any previous generation when new photo is selected
      setGeneratedImage(null);
      setGenerationError(null);

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
    setGenerationError(null);
  }, [photo]);

  const goToPanel = useCallback((panel: number) => {
    setCurrentPanel(panel);
  }, []);

  const clearGeneratedImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  const clearGenerationError = useCallback(() => {
    setGenerationError(null);
  }, []);

  /**
   * Generate pixel art from the current photo
   * Calls /api/generate and returns the result
   */
  const generatePixelArt = useCallback(async (): Promise<GenerationResult> => {
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

    try {
      // Convert file to base64
      const imageBase64 = await fileToBase64(photo.file);

      // Call the generate API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: imageBase64,
          mimeType: photo.type,
        }),
      });

      const result: GenerationResult = await response.json();

      if (result.success && result.imageBase64 && result.mimeType) {
        // Increment generation count
        generationsRef.current += 1;
        setGenerationsUsed(generationsRef.current);

        // Create data URL for display (memory only, no persistence)
        const dataUrl = `data:${result.mimeType};base64,${result.imageBase64}`;
        setGeneratedImage(dataUrl);

        return result;
      } else {
        // Handle error
        const errorMessage = result.error || "Generation failed";
        setGenerationError(errorMessage);
        return result;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setGenerationError(errorMessage);

      return {
        success: false,
        error: errorMessage,
        errorCode: "UNKNOWN",
      };
    } finally {
      setIsGenerating(false);
    }
  }, [photo]);

  const value: PhotoContextValue = {
    // State
    photo,
    source,
    isLoading,
    isGenerating,
    currentPanel,
    generatedImage,
    generationError,
    generationsUsed,
    generationLimit: SESSION_GENERATION_LIMIT,
    limitReached,
    // Actions
    setPhotoFromFile,
    clearPhoto,
    goToPanel,
    validateFile,
    generatePixelArt,
    clearGeneratedImage,
    clearGenerationError,
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
