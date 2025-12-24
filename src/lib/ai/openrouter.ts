/**
 * OpenRouter Provider Implementation
 *
 * Phase 4: OpenRouter-specific AI generation logic
 * This file contains ALL OpenRouter-specific code.
 * App code must NOT import from this file directly.
 *
 * Model: google/gemini-2.0-flash-exp:free (Nano Banana)
 */

import type {
  AIProvider,
  GenerateImageRequest,
  GenerateImageResponse,
  ProviderConfig,
} from "./types";

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
    // Validate API key
    if (!this.config.apiKey) {
      return {
        success: false,
        error: "OpenRouter API key is not configured",
        errorCode: "MISSING_API_KEY",
      };
    }

    try {
      // Build the request payload for OpenRouter
      // Using chat completions with image input
      const payload = {
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: request.prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${request.mimeType};base64,${request.imageBase64}`,
                },
              },
            ],
          },
        ],
        // Request image output
        max_tokens: 4096,
      };

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

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData?.error?.message || `HTTP ${response.status}`;

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

        // Extract generated image from response
        // OpenRouter returns images in the message content
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
          return {
            success: false,
            error: "No content in response",
            errorCode: "GENERATION_FAILED",
          };
        }

        // Check if content is an array (multimodal response)
        if (Array.isArray(content)) {
          // Look for image in the response
          const imageContent = content.find(
            (item: { type: string }) => item.type === "image_url" || item.type === "image"
          );

          if (imageContent?.image_url?.url) {
            // Extract base64 from data URL
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

          // If no image found, check for text description (model might not support image output)
          const textContent = content.find(
            (item: { type: string }) => item.type === "text"
          );
          if (textContent?.text) {
            return {
              success: false,
              error: "Model returned text instead of image. Image generation may not be supported.",
              errorCode: "GENERATION_FAILED",
            };
          }
        }

        // If content is a string, the model returned text instead of an image
        if (typeof content === "string") {
          // Check if it's a base64 image directly
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

          return {
            success: false,
            error: "Model returned text instead of image",
            errorCode: "GENERATION_FAILED",
          };
        }

        return {
          success: false,
          error: "Unexpected response format",
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
