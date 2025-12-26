/**
 * Output Validators — V2 Generation Guardrails
 *
 * Validates generated image outputs before returning to client.
 */

/**
 * Validation result for generated images
 */
export interface ImageValidation {
  ok: boolean;
  issues: string[];
}

/**
 * Minimum base64 length for a valid image
 * A 100x100 PNG is roughly 1KB = ~1400 base64 chars
 * We use a conservative threshold
 */
const MIN_BASE64_LENGTH = 1000;

/**
 * PNG header in base64 (first 8 bytes)
 * 89 50 4E 47 0D 0A 1A 0A = "iVBORw0K" in base64
 */
const PNG_HEADER_B64 = "iVBORw0K";

/**
 * JPEG header patterns in base64
 * FFD8FF = "/9j/" in base64
 */
const JPEG_HEADER_B64 = "/9j/";

/**
 * WebP header in base64
 * RIFF....WEBP = "UklGR" prefix
 */
const WEBP_HEADER_B64 = "UklGR";

/**
 * Validate a generated image base64 string
 *
 * Checks:
 * - Non-empty and above minimum length threshold
 * - Appears to be valid image data (header check)
 * - Decodes successfully (best-effort)
 *
 * @param b64 - Base64-encoded image data (without data URL prefix)
 * @returns Validation result with issues array
 */
export function validateGeneratedImageBase64(b64: string | undefined): ImageValidation {
  const issues: string[] = [];

  // Check existence
  if (!b64) {
    return { ok: false, issues: ["No image data returned"] };
  }

  // Check minimum length
  if (b64.length < MIN_BASE64_LENGTH) {
    issues.push(`Image data too small (${b64.length} chars, min ${MIN_BASE64_LENGTH})`);
  }

  // Check for valid image header
  const isPng = b64.startsWith(PNG_HEADER_B64);
  const isJpeg = b64.startsWith(JPEG_HEADER_B64);
  const isWebp = b64.startsWith(WEBP_HEADER_B64);

  if (!isPng && !isJpeg && !isWebp) {
    issues.push("Image data does not have a recognized format header (PNG/JPEG/WebP)");
  }

  // Check for valid base64 characters (best-effort)
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (!base64Pattern.test(b64)) {
    issues.push("Image data contains invalid base64 characters");
  }

  // Check for truncated base64 (should end with = padding or valid char)
  const paddingValid = b64.length % 4 === 0;
  if (!paddingValid) {
    issues.push("Image data appears truncated (invalid base64 padding)");
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

/**
 * Validate image dimensions (if known)
 * This is a placeholder for future dimension validation
 * when we can decode images server-side
 *
 * @param width - Expected width
 * @param height - Expected height
 * @param actualWidth - Actual width (if known)
 * @param actualHeight - Actual height (if known)
 */
export function validateImageDimensions(
  width: number,
  height: number,
  actualWidth?: number,
  actualHeight?: number
): ImageValidation {
  const issues: string[] = [];

  if (actualWidth !== undefined && actualHeight !== undefined) {
    // Check aspect ratio tolerance (10%)
    const expectedRatio = width / height;
    const actualRatio = actualWidth / actualHeight;
    const ratioDiff = Math.abs(expectedRatio - actualRatio) / expectedRatio;

    if (ratioDiff > 0.1) {
      issues.push(
        `Aspect ratio mismatch: expected ${width}:${height} (${expectedRatio.toFixed(2)}), ` +
        `got ${actualWidth}:${actualHeight} (${actualRatio.toFixed(2)})`
      );
    }

    // Check minimum dimensions
    if (actualWidth < 256 || actualHeight < 256) {
      issues.push(`Image too small: ${actualWidth}x${actualHeight} (min 256x256)`);
    }
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

/**
 * Combined validation for a generation result
 */
export function validateGenerationResult(
  imageBase64: string | undefined,
  expectedWidth?: number,
  expectedHeight?: number
): ImageValidation {
  // First validate the base64 data
  const base64Validation = validateGeneratedImageBase64(imageBase64);
  if (!base64Validation.ok) {
    return base64Validation;
  }

  // Dimension validation is optional (we can't easily decode server-side without deps)
  // Future: could use sharp or similar to verify dimensions

  return { ok: true, issues: [] };
}
