/**
 * AI Generation Types
 *
 * Phase 4: Type definitions for AI image generation
 * Provider-agnostic interfaces for the abstraction layer
 */

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
