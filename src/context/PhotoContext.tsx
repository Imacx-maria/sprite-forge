"use client";

/**
 * PhotoContext — Client-side Photo State Management
 *
 * Phase 3: Manages photo data in memory only.
 * - No persistence (localStorage, cookies, etc.)
 * - No server-side storage
 * - Data lost on page refresh (by design)
 *
 * TODO Phase 4: Add methods to prepare data for generation API
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  PhotoData,
  PhotoSource,
  PhotoValidationResult,
  GenerationRequest,
} from "@/types/photo";
import { PHOTO_CONSTRAINTS } from "@/types/photo";

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
  /** Current panel/step in the flow */
  currentPanel: number;
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
  /**
   * Prepare generation request (Phase 4+)
   * TODO Phase 4: Implement base64 conversion and API call
   */
  prepareGenerationRequest: () => Promise<GenerationRequest | null>;
}

type PhotoContextValue = PhotoContextState & PhotoContextActions;

const PhotoContext = createContext<PhotoContextValue | null>(null);

/**
 * Validate file against constraints
 */
function validatePhotoFile(file: File): PhotoValidationResult {
  // Check file type
  if (!PHOTO_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as typeof PHOTO_CONSTRAINTS.ALLOWED_TYPES[number])) {
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
 * PhotoProvider — Wraps app with photo state
 */
export function PhotoProvider({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [source, setSource] = useState<PhotoSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPanel, setCurrentPanel] = useState(0);

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
  }, [photo]);

  const goToPanel = useCallback((panel: number) => {
    setCurrentPanel(panel);
  }, []);

  /**
   * Prepare generation request for Phase 4
   *
   * TODO Phase 4: This method will:
   * 1. Convert the photo file to base64
   * 2. Include selected style/world options
   * 3. Return a GenerationRequest ready for /api/generate
   *
   * Currently returns a stub structure.
   */
  const prepareGenerationRequest =
    useCallback(async (): Promise<GenerationRequest | null> => {
      if (!photo || !source) {
        return null;
      }

      setIsLoading(true);

      try {
        // TODO Phase 4: Convert file to base64
        // const reader = new FileReader();
        // const base64 = await new Promise<string>((resolve) => {
        //   reader.onloadend = () => resolve(reader.result as string);
        //   reader.readAsDataURL(photo.file);
        // });

        // Phase 3: Return stub structure
        const request: GenerationRequest = {
          imageData: "[PHASE_4_TODO: base64_data_here]",
          source,
          fileName: photo.name,
          style: undefined, // TODO Phase 4: Add world/style selection
        };

        return request;
      } finally {
        setIsLoading(false);
      }
    }, [photo, source]);

  const value: PhotoContextValue = {
    // State
    photo,
    source,
    isLoading,
    currentPanel,
    // Actions
    setPhotoFromFile,
    clearPhoto,
    goToPanel,
    validateFile,
    prepareGenerationRequest,
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
