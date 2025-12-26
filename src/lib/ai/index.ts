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
  // [DIAGNOSTIC] Log function entry
  console.log("[generateDualOutput] ========== DUAL GENERATION START ==========");
  console.log("[generateDualOutput] World ID:", world.id);
  console.log("[generateDualOutput] World promptModifier:", world.promptModifier);
  console.log("[generateDualOutput] World scenePromptModifier:", world.scenePromptModifier);
  console.log("[generateDualOutput] Image mimeType:", mimeType);
  console.log("[generateDualOutput] Image base64 length:", imageBase64?.length || 0);

  // Check configuration
  if (!isConfigured()) {
    console.log("[generateDualOutput] ABORT: API key not configured");
    return {
      success: false,
      error: "AI generation is not configured. OPENROUTER_API_KEY is missing.",
      errorCode: "MISSING_API_KEY",
    };
  }

  // Validate input
  if (!imageBase64) {
    console.log("[generateDualOutput] ABORT: No image data");
    return {
      success: false,
      error: "No image data provided",
      errorCode: "INVALID_REQUEST",
    };
  }

  if (!mimeType || !mimeType.startsWith("image/")) {
    console.log("[generateDualOutput] ABORT: Invalid mimeType:", mimeType);
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

  // [DIAGNOSTIC] Log constructed prompts
  console.log("[generateDualOutput] ===== PLAYER CARD PROMPT =====");
  console.log(cardPrompt);
  console.log("[generateDualOutput] ===== PLAYER CARD PROMPT END =====");
  console.log("[generateDualOutput] Card prompt length:", cardPrompt?.length || 0);
  console.log("[generateDualOutput] Card prompt undefined?", cardPrompt === undefined);
  console.log("[generateDualOutput] Card prompt empty?", cardPrompt === "");

  console.log("[generateDualOutput] ===== WORLD SCENE PROMPT =====");
  console.log(scenePrompt);
  console.log("[generateDualOutput] ===== WORLD SCENE PROMPT END =====");
  console.log("[generateDualOutput] Scene prompt length:", scenePrompt?.length || 0);

  // Get provider
  const provider = getProvider();

  // [DIAGNOSTIC] Log before parallel generation
  console.log("[generateDualOutput] Starting parallel generation...");
  console.log("[generateDualOutput] SCENE: Request will be sent NOW");
  console.log("[generateDualOutput] SCENE: Prompt non-empty?", scenePrompt.length > 0);
  console.log("[generateDualOutput] SCENE: Prompt length:", scenePrompt.length);

  // Run BOTH generations in parallel
  // Using separate promises to add individual logging
  const cardPromise = provider.generateImage({
    imageBase64,
    mimeType,
    prompt: cardPrompt,
  }).then(result => {
    console.log("[generateDualOutput] CARD: Promise resolved");
    console.log("[generateDualOutput] CARD: success=", result.success);
    return result;
  }).catch(err => {
    console.log("[generateDualOutput] CARD: Promise REJECTED:", err);
    throw err;
  });

  const scenePromise = provider.generateImage({
    imageBase64,
    mimeType,
    prompt: scenePrompt,
  }).then(result => {
    console.log("[generateDualOutput] SCENE: Promise resolved");
    console.log("[generateDualOutput] SCENE: success=", result.success);
    console.log("[generateDualOutput] SCENE: error=", result.error);
    console.log("[generateDualOutput] SCENE: errorCode=", result.errorCode);
    console.log("[generateDualOutput] SCENE: has imageBase64=", !!result.imageBase64);
    return result;
  }).catch(err => {
    console.log("[generateDualOutput] SCENE: Promise REJECTED:", err);
    throw err;
  });

  const [cardResult, sceneResult] = await Promise.all([cardPromise, scenePromise]);

  // [DIAGNOSTIC] Log results
  console.log("[generateDualOutput] ===== CARD RESULT =====");
  console.log("[generateDualOutput] Card success:", cardResult.success);
  console.log("[generateDualOutput] Card error:", cardResult.error);
  console.log("[generateDualOutput] Card errorCode:", cardResult.errorCode);
  console.log("[generateDualOutput] Card has imageBase64:", !!cardResult.imageBase64);
  console.log("[generateDualOutput] Card imageBase64 length:", cardResult.imageBase64?.length || 0);

  console.log("[generateDualOutput] ===== SCENE RESULT =====");
  console.log("[generateDualOutput] Scene success:", sceneResult.success);
  console.log("[generateDualOutput] Scene error:", sceneResult.error);
  console.log("[generateDualOutput] Scene errorCode:", sceneResult.errorCode);
  console.log("[generateDualOutput] Scene has imageBase64:", !!sceneResult.imageBase64);
  console.log("[generateDualOutput] Scene imageBase64 length:", sceneResult.imageBase64?.length || 0);

  // Determine overall success (at least one succeeded)
  const success = cardResult.success || sceneResult.success;

  console.log("[generateDualOutput] Overall success:", success);
  console.log("[generateDualOutput] ========== DUAL GENERATION END ==========");

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
