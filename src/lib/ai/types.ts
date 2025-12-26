/**
 * AI Generation Types
 *
 * Phase 4: Type definitions for AI image generation
 * Phase 8: Extended for dual-output generation (Player Card + World Scene)
 * Provider-agnostic interfaces for the abstraction layer
 */

/**
 * Output dimensions for image generation
 * V2: Explicit aspect ratios for card and scene
 */
export const OUTPUT_DIMENSIONS = {
  /** Player Card: Portrait format (3:4 aspect ratio) */
  CARD: {
    WIDTH: 1728,
    HEIGHT: 2304,
  },
  /** World Scene: Landscape format (16:9 aspect ratio) */
  SCENE: {
    WIDTH: 2560,
    HEIGHT: 1440,
  },
} as const;

/**
 * Image generation request
 */
export interface GenerateImageRequest {
  /** Base64-encoded source image */
  imageBase64: string;
  /** MIME type of the source image */
  mimeType: string;
  /** Generation prompt */
  prompt: string;
  /** Output image width in pixels (optional) */
  width?: number;
  /** Output image height in pixels (optional) */
  height?: number;
}

/**
 * Image generation response
 */
export interface GenerateImageResponse {
  /** Whether generation succeeded */
  success: boolean;
  /** Generated image as base64 (if successful) */
  imageBase64?: string;
  /** MIME type of generated image */
  mimeType?: string;
  /** Error message (if failed) */
  error?: string;
  /** Error code for client handling */
  errorCode?: GenerationErrorCode;
}

/**
 * Error codes for generation failures
 */
export type GenerationErrorCode =
  | "MISSING_API_KEY"
  | "API_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "INVALID_REQUEST"
  | "GENERATION_FAILED"
  | "MODEL_RETURNED_TEXT"
  | "UNKNOWN";

/**
 * AI Provider interface
 * All providers must implement this interface
 */
export interface AIProvider {
  /** Provider name for logging */
  name: string;
  /** Generate an image from a source image */
  generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** API key for the provider */
  apiKey: string;
  /** Model identifier */
  model: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Dual-output generation response
 * Phase 8: Returns both Player Card and World Scene images
 */
export interface DualGenerationResponse {
  /** Whether at least one generation succeeded */
  success: boolean;
  /** Player Card generation result */
  cardImage?: GenerateImageResponse;
  /** World Scene generation result */
  worldSceneImage?: GenerateImageResponse;
  /** Overall error message (if both failed) */
  error?: string;
  /** Overall error code (if both failed) */
  errorCode?: GenerationErrorCode;
}
