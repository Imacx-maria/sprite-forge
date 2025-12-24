/**
 * AI Abstraction Layer
 *
 * Phase 4: Main entry point for AI generation
 * Phase 6: World-based prompt modifiers
 * Phase 8: Dual-output generation (Player Card + World Scene)
 *
 * All app code must use this file for AI operations.
 * DO NOT import from provider files directly.
 *
 * This abstraction allows:
 * - Easy provider switching
 * - Centralized configuration
 * - Consistent error handling
 * - World-based prompt variation
 * - Parallel dual-output generation
 */

import { createOpenRouterProvider } from "./openrouter";
import { buildPlayerCardPrompt, buildWorldScenePrompt } from "./prompts";
import type {
  AIProvider,
  GenerateImageRequest,
  GenerateImageResponse,
  DualGenerationResponse,
} from "./types";
import type { WorldDefinition } from "@/lib/worlds/types";

// Re-export types for app code
export type {
  GenerateImageRequest,
  GenerateImageResponse,
  GenerationErrorCode,
  DualGenerationResponse,
} from "./types";

/**
 * Base prompt template for pixel-art character generation
 * World modifiers are appended to this base prompt
 */
const BASE_PROMPT = `Transform this photo into a pixel-art game character sprite.

Style requirements:
- 16-bit retro game aesthetic
- Clean pixel art with visible pixels
- Character should be centered
- Simple color palette (max 16 colors)
- Game-ready sprite appearance
- Transparent or solid color background`;

/**
 * Final instruction appended after world modifier
 */
const PROMPT_SUFFIX = `Generate ONLY the pixel art image, no text or explanations.`;

/**
 * Build the complete prompt with optional world modifier
 *
 * Structure:
 * 1. Base prompt (character transformation rules)
 * 2. World modifier (setting, style, mood)
 * 3. Suffix (output instruction)
 */
export function buildPrompt(worldModifier?: string): string {
  if (worldModifier) {
    return `${BASE_PROMPT}

World Theme:
${worldModifier}

${PROMPT_SUFFIX}`;
  }

  return `${BASE_PROMPT}

${PROMPT_SUFFIX}`;
}

/**
 * Get the configured AI provider
 * Currently uses OpenRouter with Gemini 2.0 Flash model
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
 * @param worldModifier - Optional world theme modifier to append to prompt
 * @returns Generation result with image or error
 */
export async function generatePixelArt(
  imageBase64: string,
  mimeType: string,
  worldModifier?: string
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

  // Build prompt with world modifier
  const prompt = buildPrompt(worldModifier);

  // Get provider and generate
  const provider = getProvider();
  const request: GenerateImageRequest = {
    imageBase64,
    mimeType,
    prompt,
  };

  return provider.generateImage(request);
}

/**
 * Generate BOTH Player Card and World Scene images in parallel
 *
 * Phase 8: Dual-output generation
 *
 * @param imageBase64 - Base64-encoded source image
 * @param mimeType - MIME type of the source image
 * @param world - World definition with all prompt modifiers
 * @returns Both generation results (partial success allowed)
 */
export async function generateDualOutput(
  imageBase64: string,
  mimeType: string,
  world: WorldDefinition
): Promise<DualGenerationResponse> {
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

  // Build prompts for both outputs
  const cardPrompt = buildPlayerCardPrompt(world.promptModifier);
  const scenePrompt = buildWorldScenePrompt(
    world.scenePromptModifier,
    world.sceneCamera
  );

  // Get provider
  const provider = getProvider();

  // Run BOTH generations in parallel
  const [cardResult, sceneResult] = await Promise.all([
    provider.generateImage({
      imageBase64,
      mimeType,
      prompt: cardPrompt,
    }),
    provider.generateImage({
      imageBase64,
      mimeType,
      prompt: scenePrompt,
    }),
  ]);

  // Determine overall success (at least one succeeded)
  const success = cardResult.success || sceneResult.success;

  // If both failed, return combined error
  if (!success) {
    return {
      success: false,
      cardImage: cardResult,
      worldSceneImage: sceneResult,
      error: "Both generations failed",
      errorCode: cardResult.errorCode || sceneResult.errorCode || "GENERATION_FAILED",
    };
  }

  // Return both results (partial success allowed)
  return {
    success: true,
    cardImage: cardResult,
    worldSceneImage: sceneResult,
  };
}
