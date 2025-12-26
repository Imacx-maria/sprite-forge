/**
 * AI Abstraction Layer
 *
 * Phase 4: Main entry point for AI generation
 * Phase 6: World-based prompt modifiers
 * Phase 8: Dual-output generation (Player Card + World Scene)
 * V2: Prompt compilation + guardrails + single retry
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
 * - V2: Centralized prompt compilation
 * - V2: Output validation and retry logic
 */

import { createOpenRouterProvider } from "./openrouter";
import { compilePrompt, hardenPrompt, type OutputType, type PromptInput } from "./prompt-compiler";
import { validateGeneratedImageBase64 } from "./validators";
import {
  OUTPUT_DIMENSIONS,
  type AIProvider,
  type GenerateImageRequest,
  type GenerateImageResponse,
  type DualGenerationResponse,
} from "./types";
import type { WorldDefinition } from "@/lib/worlds/types";
import {
  generateCardContent,
  generateLandscapeUI,
  generateRandomName,
  enforceNameLimit,
} from "@/lib/card";

// Re-export types and constants for app code
export type {
  GenerateImageRequest,
  GenerateImageResponse,
  GenerationErrorCode,
  DualGenerationResponse,
} from "./types";
export { OUTPUT_DIMENSIONS } from "./types";

// V2: Export prompt compiler types
export type { OutputType, TargetSize, CompiledPrompt, PromptInput } from "./prompt-compiler";
export { compilePrompt, hardenPrompt } from "./prompt-compiler";

// V2: Export validators
export { validateGeneratedImageBase64, validateGenerationResult } from "./validators";

// V2: Export provider adapter for centralized dimension handling
export type { TargetSize as ProviderTargetSize } from "./provider-adapter";
export {
  buildDimensionPayload,
  detectProviderType,
  validateNoConflictingDimensions,
} from "./provider-adapter";

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
 * V2: Generate a single output with retry logic
 */
async function generateWithRetry(
  provider: AIProvider,
  request: GenerateImageRequest,
  outputType: OutputType
): Promise<GenerateImageResponse> {
  // First attempt
  console.log(`[generateWithRetry] ${outputType.toUpperCase()}: First attempt`);
  // DEBUG ONLY: expose the fully hydrated prompt right before the AI call
  console.log("SPRITE FORGE FINAL PROMPT", request.prompt);
  let result = await provider.generateImage(request);

  // If successful, validate the output
  if (result.success && result.imageBase64) {
    const validation = validateGeneratedImageBase64(result.imageBase64);
    if (validation.ok) {
      console.log(`[generateWithRetry] ${outputType.toUpperCase()}: First attempt succeeded`);
      return result;
    }

    // Validation failed - log issues
    console.log(`[generateWithRetry] ${outputType.toUpperCase()}: Validation failed:`, validation.issues);
  } else {
    console.log(`[generateWithRetry] ${outputType.toUpperCase()}: First attempt failed:`, result.error);
  }

  // Retry with hardened prompt
  console.log(`[generateWithRetry] ${outputType.toUpperCase()}: Retrying with hardened prompt`);
  const hardenedRequest: GenerateImageRequest = {
    ...request,
    prompt: hardenPrompt(request.prompt),
  };

  result = await provider.generateImage(hardenedRequest);

  // Validate retry result
  if (result.success && result.imageBase64) {
    const validation = validateGeneratedImageBase64(result.imageBase64);
    if (validation.ok) {
      console.log(`[generateWithRetry] ${outputType.toUpperCase()}: Retry succeeded`);
      return result;
    }
    console.log(`[generateWithRetry] ${outputType.toUpperCase()}: Retry validation failed:`, validation.issues);
  } else {
    console.log(`[generateWithRetry] ${outputType.toUpperCase()}: Retry failed:`, result.error);
  }

  // Return whatever we got (success or failure)
  return result;
}

/**
 * Generate BOTH Player Card and World Scene images in parallel
 *
 * Phase 8: Dual-output generation
 * V2: Uses compilePrompt for centralized prompt assembly + retry logic
 *
 * @param imageBase64 - Base64-encoded source image
 * @param mimeType - MIME type of the source image
 * @param world - World definition with all prompt modifiers
 * @returns Both generation results (partial success allowed)
 */
export async function generateDualOutput(
  imageBase64: string,
  mimeType: string,
  world: WorldDefinition,
  promptInput?: PromptInput
): Promise<DualGenerationResponse> {
  // [DIAGNOSTIC] Log function entry
  console.log("[generateDualOutput] ========== DUAL GENERATION START ==========");
  console.log("[generateDualOutput] World ID:", world.id);
  console.log("[generateDualOutput] V2: Using compilePrompt for centralized prompt assembly");
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

  const resolvedName =
    promptInput?.name && promptInput.name.trim().length > 0
      ? enforceNameLimit(promptInput.name)
      : generateRandomName();
  const cardContent = promptInput?.cardContent ?? generateCardContent(world);
  const sceneUI = promptInput?.sceneUI ?? generateLandscapeUI(world);
  const resolvedPromptInput: PromptInput = {
    ...promptInput,
    name: resolvedName,
    cardContent,
    sceneUI,
  };

  // V2: Use compilePrompt for centralized prompt assembly
  const cardCompiled = compilePrompt(world, resolvedPromptInput, "card");
  const sceneCompiled = compilePrompt(world, resolvedPromptInput, "scene");

  // [DIAGNOSTIC] Log compiled prompts
  console.log("[generateDualOutput] ===== V2 COMPILED CARD PROMPT =====");
  console.log("[generateDualOutput] Card prompt length:", cardCompiled.prompt.length);
  console.log("[generateDualOutput] Card target size:", cardCompiled.targetSize);
  console.log("[generateDualOutput] Card aspect ratio:", cardCompiled.aspectRatio);

  console.log("[generateDualOutput] ===== V2 COMPILED SCENE PROMPT =====");
  console.log("[generateDualOutput] Scene prompt length:", sceneCompiled.prompt.length);
  console.log("[generateDualOutput] Scene target size:", sceneCompiled.targetSize);
  console.log("[generateDualOutput] Scene aspect ratio:", sceneCompiled.aspectRatio);

  // Get provider
  const provider = getProvider();

  // [DIAGNOSTIC] Log before parallel generation
  console.log("[generateDualOutput] Starting parallel generation with retry logic...");
  console.log("[generateDualOutput] CARD dimensions:", cardCompiled.targetSize.width, "x", cardCompiled.targetSize.height);
  console.log("[generateDualOutput] SCENE dimensions:", sceneCompiled.targetSize.width, "x", sceneCompiled.targetSize.height);

  // V2: Run BOTH generations in parallel with retry logic
  const cardPromise = generateWithRetry(
    provider,
    {
      imageBase64,
      mimeType,
      prompt: cardCompiled.prompt,
      width: cardCompiled.targetSize.width,
      height: cardCompiled.targetSize.height,
    },
    "card"
  ).then(result => {
    console.log("[generateDualOutput] CARD: Final result - success=", result.success);
    return result;
  });

  const scenePromise = generateWithRetry(
    provider,
    {
      imageBase64,
      mimeType,
      prompt: sceneCompiled.prompt,
      width: sceneCompiled.targetSize.width,
      height: sceneCompiled.targetSize.height,
    },
    "scene"
  ).then(result => {
    console.log("[generateDualOutput] SCENE: Final result - success=", result.success);
    return result;
  });

  const [cardResult, sceneResult] = await Promise.all([cardPromise, scenePromise]);

  // [DIAGNOSTIC] Log results
  console.log("[generateDualOutput] ===== FINAL RESULTS =====");
  console.log("[generateDualOutput] Card success:", cardResult.success);
  console.log("[generateDualOutput] Card error:", cardResult.error);
  console.log("[generateDualOutput] Card has imageBase64:", !!cardResult.imageBase64);
  console.log("[generateDualOutput] Card imageBase64 length:", cardResult.imageBase64?.length || 0);

  console.log("[generateDualOutput] Scene success:", sceneResult.success);
  console.log("[generateDualOutput] Scene error:", sceneResult.error);
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
