/**
 * Provider Adapter - Centralized Dimension Mapping
 *
 * V2: Single source of truth for converting internal targetSize
 * to provider-specific payload formats.
 *
 * RULES:
 * - Seedream: ONLY image_size object { width, height }
 *   DO NOT include image_config.image_size preset (conflicts!)
 * - Gemini: image_config with aspect_ratio + image_size preset
 * - Never send both explicit dimensions AND size presets
 */

/**
 * Internal target size specification
 * Used throughout the app, converted to provider format at API boundary
 */
export interface TargetSize {
  width: number;
  height: number;
}

/**
 * Provider types we support
 */
export type ProviderType = "seedream" | "gemini" | "generic";

/**
 * Detect provider type from model string
 */
export function detectProviderType(model: string): ProviderType {
  const modelLower = model.toLowerCase();

  if (modelLower.includes("seedream") || modelLower.includes("bytedance")) {
    return "seedream";
  }

  if (modelLower.includes("gemini") || modelLower.includes("google")) {
    return "gemini";
  }

  return "generic";
}

/**
 * Provider-specific dimension payload
 * Only includes fields relevant to that provider
 */
export interface DimensionPayload {
  // Seedream format: object with width/height
  image_size?: { width: number; height: number };

  // Gemini format: aspect_ratio only (NO image_size preset to avoid conflicts)
  image_config?: { aspect_ratio: string };

  // Generic fallback: top-level fields
  width?: number;
  height?: number;
  size?: string;
}

/**
 * Calculate GCD for aspect ratio simplification
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Build provider-specific dimension payload
 *
 * CRITICAL: For Seedream, we ONLY send image_size object.
 * We do NOT send image_config.image_size preset as it can override
 * the explicit dimensions on some provider configurations.
 *
 * @param targetSize - Internal dimension specification { width, height }
 * @param providerType - Detected or specified provider type
 * @returns Provider-specific payload fields for dimensions
 */
export function buildDimensionPayload(
  targetSize: TargetSize,
  providerType: ProviderType
): DimensionPayload {
  const { width, height } = targetSize;

  // Calculate aspect ratio for providers that need it
  const divisor = gcd(width, height);
  const aspectRatio = `${width / divisor}:${height / divisor}`;

  switch (providerType) {
    case "seedream":
      // Seedream: image_size object + image_config.aspect_ratio
      // NO image_config.image_size preset - that can conflict!
      // But we DO need aspect_ratio to hint the model about orientation
      return {
        image_size: { width, height },
        image_config: { aspect_ratio: aspectRatio },
      };

    case "gemini":
      // Gemini: image_config with aspect_ratio only
      // Let the provider determine resolution from aspect ratio
      return {
        image_config: { aspect_ratio: aspectRatio },
      };

    case "generic":
    default:
      // Generic: top-level width/height/size
      return {
        width,
        height,
        size: `${width}x${height}`,
      };
  }
}

/**
 * Build complete image generation payload with dimensions
 *
 * This is the single entry point for constructing payloads.
 * Call sites pass targetSize, adapter handles provider-specific mapping.
 *
 * @param model - Model identifier string
 * @param prompt - Generation prompt
 * @param imageDataUrl - Base64 data URL for input image
 * @param targetSize - Target output dimensions
 * @returns Complete payload ready for API call
 */
export function buildImageRequestPayload(
  model: string,
  prompt: string,
  imageDataUrl: string,
  targetSize: TargetSize | null
): Record<string, unknown> {
  const providerType = detectProviderType(model);

  const payload: Record<string, unknown> = {
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    max_tokens: 4096,
  };

  // Add dimension fields if targetSize specified
  if (targetSize) {
    const dimensionPayload = buildDimensionPayload(targetSize, providerType);

    // Merge dimension fields into payload
    Object.assign(payload, dimensionPayload);

    // Log what we're sending (debug)
    if (process.env.DEBUG_IMAGE_PAYLOAD === "1") {
      console.log(`[ProviderAdapter] Provider type: ${providerType}`);
      console.log(`[ProviderAdapter] Target size: ${targetSize.width}x${targetSize.height}`);
      console.log(`[ProviderAdapter] Dimension payload:`, dimensionPayload);
    }
  }

  return payload;
}

/**
 * Validate that a payload does NOT contain conflicting dimension specs
 *
 * ALLOWED: image_size object + image_config.aspect_ratio (these complement each other)
 * FORBIDDEN: image_config.image_size preset (string like "2K") when image_size object exists
 *
 * The image_config.image_size PRESET can override explicit dimensions on some providers.
 */
export function validateNoConflictingDimensions(
  payload: Record<string, unknown>
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  const hasImageSizeObject =
    payload.image_size &&
    typeof payload.image_size === "object" &&
    "width" in (payload.image_size as object);

  const imageConfig = payload.image_config as Record<string, unknown> | undefined;
  const hasImageConfigSizePreset =
    imageConfig &&
    "image_size" in imageConfig &&
    typeof imageConfig.image_size === "string";

  // FAIL: Both explicit dimensions AND size preset (conflict!)
  if (hasImageSizeObject && hasImageConfigSizePreset) {
    issues.push(
      `CONFLICT: Both image_size object AND image_config.image_size="${imageConfig?.image_size}" preset are set. ` +
        "The preset can override explicit dimensions. Remove image_config.image_size."
    );
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
