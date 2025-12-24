/**
 * AI Abstraction Layer
 *
 * Phase 4: Main entry point for AI generation
 * All app code must use this file for AI operations.
 * DO NOT import from provider files directly.
 *
 * This abstraction allows:
 * - Easy provider switching
 * - Centralized configuration
 * - Consistent error handling
 */

import { createOpenRouterProvider } from "./openrouter";
import type {
  AIProvider,
  GenerateImageRequest,
  GenerateImageResponse,
} from "./types";

// Re-export types for app code
export type {
  GenerateImageRequest,
  GenerateImageResponse,
  GenerationErrorCode,
} from "./types";

/**
 * Default prompt template for pixel-art character generation
 */
const DEFAULT_PROMPT = `Transform this photo into a pixel-art game character sprite.

Style requirements:
- 16-bit retro game aesthetic
- Clean pixel art with visible pixels
- Character should be centered
- Simple color palette (max 16 colors)
- Game-ready sprite appearance
- Transparent or solid color background

Generate ONLY the pixel art image, no text or explanations.`;

/**
 * Get the configured AI provider
 * Currently uses OpenRouter with Nano Banana model
 */
function getProvider(): AIProvider {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";

  return createOpenRouterProvider({
    apiKey: apiKey || "",
    model,
    timeout: 60000,
  });
}

/**
 * Check if AI generation is properly configured
 */
export function isConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

/**
 * Get the current model name for display
 */
export function getModelName(): string {
  return process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";
}

/**
 * Generate a pixel-art character from a photo
 *
 * @param imageBase64 - Base64-encoded source image
 * @param mimeType - MIME type of the source image
 * @param customPrompt - Optional custom prompt (uses default if not provided)
 * @returns Generation result with image or error
 */
export async function generatePixelArt(
  imageBase64: string,
  mimeType: string,
  customPrompt?: string
): Promise<GenerateImageResponse> {
  // Check configuration
  if (!isConfigured()) {
    return {
      success: false,
      error: "AI generation is not configured. OPENROUTER_API_KEY is missing.",
      errorCode: "MISSING_API_KEY",
    };
  }

  // Validate input
  if (!imageBase64) {
    return {
      success: false,
      error: "No image data provided",
      errorCode: "INVALID_REQUEST",
    };
  }

  if (!mimeType || !mimeType.startsWith("image/")) {
    return {
      success: false,
      error: "Invalid image type",
      errorCode: "INVALID_REQUEST",
    };
  }

  // Get provider and generate
  const provider = getProvider();
  const request: GenerateImageRequest = {
    imageBase64,
    mimeType,
    prompt: customPrompt || DEFAULT_PROMPT,
  };

  return provider.generateImage(request);
}
