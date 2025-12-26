/**
 * OpenRouter Provider Implementation
 *
 * Phase 4: OpenRouter-specific AI generation logic
 * V2: Uses provider adapter for dimension mapping (no conflicting presets)
 *
 * This file contains ALL OpenRouter-specific code.
 * App code must NOT import from this file directly.
 *
 * Model is configured via OPENROUTER_MODEL env variable.
 * Recommended: bytedance-seed/seedream-4.5 for best pixel art results.
 */

import type {
  AIProvider,
  GenerateImageRequest,
  GenerateImageResponse,
  ProviderConfig,
} from "./types";
import {
  buildImageRequestPayload,
  validateNoConflictingDimensions,
  type TargetSize,
} from "./provider-adapter";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_TIMEOUT = 60000; // 60 seconds

/**
 * OpenRouter provider for image generation
 */
export class OpenRouterProvider implements AIProvider {
  readonly name = "OpenRouter";
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = {
      ...config,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };
  }

  /**
   * Generate a pixel-art character from a source image
   */
  async generateImage(
    request: GenerateImageRequest
  ): Promise<GenerateImageResponse> {
    // [DIAGNOSTIC] Generate request ID for tracing
    const requestId = Math.random().toString(36).substring(2, 8);
    const debugEnabled = process.env.DEBUG_IMAGE_PAYLOAD === "1";

    console.log(`[OpenRouter:${requestId}] ===== generateImage CALLED =====`);
    console.log(`[OpenRouter:${requestId}] Prompt preview (first 100 chars):`, request.prompt?.substring(0, 100));
    console.log(`[OpenRouter:${requestId}] Prompt length:`, request.prompt?.length || 0);
    console.log(`[OpenRouter:${requestId}] MimeType:`, request.mimeType);
    console.log(`[OpenRouter:${requestId}] Image base64 length:`, request.imageBase64?.length || 0);
    console.log(`[OpenRouter:${requestId}] Requested dimensions: ${request.width || 'default'}x${request.height || 'default'}`);

    // Validate API key
    if (!this.config.apiKey) {
      console.log(`[OpenRouter:${requestId}] ABORT: No API key`);
      return {
        success: false,
        error: "OpenRouter API key is not configured",
        errorCode: "MISSING_API_KEY",
      };
    }

    try {
      // V2: Build payload using centralized provider adapter
      // This ensures correct dimension format per provider, no conflicting presets
      const imageDataUrl = `data:${request.mimeType};base64,${request.imageBase64}`;
      const targetSize: TargetSize | null =
        request.width && request.height
          ? { width: request.width, height: request.height }
          : null;

      const payload = buildImageRequestPayload(
        this.config.model,
        request.prompt,
        imageDataUrl,
        targetSize
      );

      // V2: Validate no conflicting dimension specs
      if (targetSize) {
        const validation = validateNoConflictingDimensions(payload);
        if (!validation.valid) {
          console.error(`[OpenRouter:${requestId}] DIMENSION CONFLICT:`, validation.issues);
        }
      }

      // [DIAGNOSTIC] Log payload structure (not full image data)
      console.log(`[OpenRouter:${requestId}] Payload model:`, payload.model);
      console.log(`[OpenRouter:${requestId}] Payload image_size:`, payload.image_size);
      console.log(`[OpenRouter:${requestId}] Payload image_config:`, payload.image_config);
      const messages = payload.messages as Array<{ content: Array<{ type: string }> }>;
      console.log(`[OpenRouter:${requestId}] Payload message content types:`,
        messages[0].content.map((c: { type: string }) => c.type));
      console.log(`[OpenRouter:${requestId}] Sending request to OpenRouter...`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            "HTTP-Referer": "https://sprite-forge.app",
            "X-Title": "SPRITE FORGE",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`[OpenRouter:${requestId}] Response status:`, response.status);
        console.log(`[OpenRouter:${requestId}] Response ok:`, response.ok);

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData?.error?.message || `HTTP ${response.status}`;

          console.log(`[OpenRouter:${requestId}] HTTP Error:`, response.status, errorMessage);
          console.log(`[OpenRouter:${requestId}] Error data:`, JSON.stringify(errorData).substring(0, 500));

          if (response.status === 401) {
            return {
              success: false,
              error: "Invalid API key",
              errorCode: "MISSING_API_KEY",
            };
          }

          if (response.status === 429) {
            return {
              success: false,
              error: "Rate limit exceeded. Please try again later.",
              errorCode: "RATE_LIMIT",
            };
          }

          return {
            success: false,
            error: `API error: ${errorMessage}`,
            errorCode: "API_ERROR",
          };
        }

        // Parse response
        const data = await response.json();

        // [DIAGNOSTIC] Log full response structure
        console.log(`[OpenRouter:${requestId}] Response keys:`, Object.keys(data));
        console.log(`[OpenRouter:${requestId}] Has choices:`, !!data?.choices);
        console.log(`[OpenRouter:${requestId}] Choices length:`, data?.choices?.length || 0);
        if (data?.choices?.[0]) {
          console.log(`[OpenRouter:${requestId}] Choice[0] keys:`, Object.keys(data.choices[0]));
        }

        // Extract message from response
        const message = data?.choices?.[0]?.message;

        // [DIAGNOSTIC] Log message structure
        if (message) {
          console.log(`[OpenRouter:${requestId}] Message keys:`, Object.keys(message));
          console.log(`[OpenRouter:${requestId}] Has message.images:`, !!message.images);
          console.log(`[OpenRouter:${requestId}] message.images length:`, message.images?.length || 0);
          console.log(`[OpenRouter:${requestId}] Has message.content:`, !!message.content);
          console.log(`[OpenRouter:${requestId}] message.content type:`, typeof message.content);
          if (Array.isArray(message.content)) {
            console.log(`[OpenRouter:${requestId}] message.content is array, length:`, message.content.length);
            console.log(`[OpenRouter:${requestId}] message.content types:`,
              message.content.map((c: { type: string }) => c.type));
          } else if (typeof message.content === "string") {
            console.log(`[OpenRouter:${requestId}] message.content (string) length:`, message.content.length);
            console.log(`[OpenRouter:${requestId}] message.content preview:`, message.content.substring(0, 200));
          }
        } else {
          console.log(`[OpenRouter:${requestId}] NO MESSAGE in response`);
          console.log(`[OpenRouter:${requestId}] Full response (truncated):`, JSON.stringify(data).substring(0, 1000));
        }

        if (!message) {
          console.error("[OpenRouter] No message in response");
          return {
            success: false,
            error: "No message in response from model",
            errorCode: "GENERATION_FAILED",
          };
        }

        // PRIORITY 1: Check message.images[] array first
        // OpenRouter/Gemini places generated images here, NOT in content
        const images = message.images as
          | Array<{
              type: string;
              image_url?: { url: string };
              inline_data?: { data: string; mime_type?: string };
              data?: string;
              mime_type?: string;
            }>
          | undefined;

        if (images && Array.isArray(images) && images.length > 0) {
          const imageBlock = images[0];

          // Format: image_url with data URL
          if (imageBlock.image_url?.url) {
            const dataUrl = imageBlock.image_url.url;
            const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

            if (matches) {
              return {
                success: true,
                imageBase64: matches[2],
                mimeType: matches[1],
              };
            }

            console.error(
              "[OpenRouter] Image URL is not a data URL:",
              dataUrl.substring(0, 50)
            );
          }

          // Format: inline_data with base64
          if (imageBlock.inline_data?.data) {
            return {
              success: true,
              imageBase64: imageBlock.inline_data.data,
              mimeType: imageBlock.inline_data.mime_type || "image/png",
            };
          }

          // Format: direct data field
          if (imageBlock.data && typeof imageBlock.data === "string") {
            return {
              success: true,
              imageBase64: imageBlock.data,
              mimeType: imageBlock.mime_type || "image/png",
            };
          }

          // Images array exists but couldn't extract data
          console.error(
            "[OpenRouter] Images array exists but failed to extract:",
            JSON.stringify(imageBlock).substring(0, 200)
          );
        }

        // PRIORITY 2: Check content for image data (fallback for other formats)
        const content = message.content;

        // Check if content is an array (multimodal response in content)
        if (Array.isArray(content)) {
          const imageContent = content.find(
            (item: { type: string }) =>
              item.type === "output_image" ||
              item.type === "image" ||
              item.type === "image_url"
          );

          if (imageContent) {
            // Gemini format: inline_data
            if (imageContent.inline_data?.data) {
              return {
                success: true,
                imageBase64: imageContent.inline_data.data,
                mimeType: imageContent.inline_data.mime_type || "image/png",
              };
            }

            // Direct data field
            if (imageContent.data && typeof imageContent.data === "string") {
              return {
                success: true,
                imageBase64: imageContent.data,
                mimeType: imageContent.mime_type || "image/png",
              };
            }

            // image_url format
            if (imageContent.image_url?.url) {
              const dataUrl = imageContent.image_url.url;
              const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

              if (matches) {
                return {
                  success: true,
                  imageBase64: matches[2],
                  mimeType: matches[1],
                };
              }
            }
          }

          // Content array has text only (no images found)
          const textContent = content.find(
            (item: { type: string }) => item.type === "text"
          );
          if (textContent?.text) {
            console.error(
              "[OpenRouter] Model returned text instead of image:",
              textContent.text.substring(0, 200)
            );
            return {
              success: false,
              error: "Model returned text instead of image",
              errorCode: "MODEL_RETURNED_TEXT",
            };
          }
        }

        // If content is a non-empty string, the model returned text only
        if (typeof content === "string" && content.length > 0) {
          // Check if it's a base64 image directly (unlikely but handle it)
          if (content.startsWith("data:image")) {
            const matches = content.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              return {
                success: true,
                imageBase64: matches[2],
                mimeType: matches[1],
              };
            }
          }

          // It's text, not an image
          console.error(
            "[OpenRouter] Model returned text instead of image:",
            content.substring(0, 200)
          );
          return {
            success: false,
            error: "Model returned text instead of image",
            errorCode: "MODEL_RETURNED_TEXT",
          };
        }

        // No images and no meaningful content - true generation failure
        console.error(
          "[OpenRouter] No images or content in response. Message keys:",
          Object.keys(message)
        );

        return {
          success: false,
          error: "No image generated. The model returned an empty response.",
          errorCode: "GENERATION_FAILED",
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return {
            success: false,
            error: "Request timed out",
            errorCode: "TIMEOUT",
          };
        }

        throw fetchError;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        success: false,
        error: message,
        errorCode: "UNKNOWN",
      };
    }
  }
}

/**
 * Create an OpenRouter provider instance
 * This is the only export app code should use (via lib/ai/index.ts)
 */
export function createOpenRouterProvider(
  config: ProviderConfig
): OpenRouterProvider {
  return new OpenRouterProvider(config);
}
