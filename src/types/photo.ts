/**
 * Photo Types for SPRITE FORGE
 *
 * Phase 3: Client-side photo input types
 * These types define the structure for photo data held in memory.
 *
 * Note: All data is client-side only. No persistence.
 */

/**
 * Validation result for photo input
 */
export interface PhotoValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Photo data structure held in memory
 * Structured for future handoff to generation API
 */
export interface PhotoData {
  /** Original file object (held in memory only) */
  file: File;
  /** Object URL for preview display */
  previewUrl: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** Timestamp when photo was added */
  addedAt: number;
}

/**
 * Photo input source type
 */
export type PhotoSource = "upload" | "webcam";

/**
 * Generation request structure (Phase 4+ preparation)
 *
 * TODO Phase 4: This will be sent to /api/generate
 * - Convert file to base64 or upload to temporary storage
 * - Include selected style/world options
 * - Send to Replicate API for sprite generation
 */
export interface GenerationRequest {
  /** Base64-encoded image data (Phase 4: populated before API call) */
  imageData: string;
  /** Source of the photo */
  source: PhotoSource;
  /** Original file name */
  fileName: string;
  /** Selected style/world (Phase 4: add world selection) */
  style?: string;
}

/**
 * Validation constants
 */
export const PHOTO_CONSTRAINTS = {
  /** Maximum file size in bytes (10MB) */
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  /** Maximum file size display string */
  MAX_SIZE_DISPLAY: "10MB",
  /** Allowed MIME types */
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  /** Allowed extensions for display */
  ALLOWED_EXTENSIONS: ["JPG", "PNG", "WEBP", "GIF"],
} as const;
