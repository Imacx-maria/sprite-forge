/**
 * Client-side Image Resize Utility
 *
 * Phase 8 Stabilization: Prevents oversized uploads
 * - Uses browser canvas API only
 * - No external dependencies
 * - Resizes large images before upload
 */

/**
 * Resize configuration
 */
export const RESIZE_CONFIG = {
  /** Maximum dimension (width or height) in pixels */
  MAX_DIMENSION: 1024,
  /** Output JPEG quality (0-1) */
  QUALITY: 0.8,
  /** Output MIME type */
  OUTPUT_TYPE: "image/jpeg" as const,
} as const;

/**
 * Result of resize operation
 */
export interface ResizeResult {
  success: true;
  file: File;
  wasResized: boolean;
  originalSize: number;
  newSize: number;
}

export interface ResizeError {
  success: false;
  error: string;
}

export type ResizeOutput = ResizeResult | ResizeError;

/**
 * Check if an image needs resizing based on its dimensions
 */
function needsResize(width: number, height: number): boolean {
  return width > RESIZE_CONFIG.MAX_DIMENSION || height > RESIZE_CONFIG.MAX_DIMENSION;
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateNewDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  if (!needsResize(width, height)) {
    return { width, height };
  }

  const ratio = Math.min(
    RESIZE_CONFIG.MAX_DIMENSION / width,
    RESIZE_CONFIG.MAX_DIMENSION / height
  );

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Convert canvas to File
 */
function canvasToFile(
  canvas: HTMLCanvasElement,
  originalName: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }

        // Generate new filename with .jpg extension
        const baseName = originalName.replace(/\.[^.]+$/, "");
        const newName = `${baseName}-resized.jpg`;

        const file = new File([blob], newName, {
          type: RESIZE_CONFIG.OUTPUT_TYPE,
        });

        resolve(file);
      },
      RESIZE_CONFIG.OUTPUT_TYPE,
      RESIZE_CONFIG.QUALITY
    );
  });
}

/**
 * Resize an image file if it exceeds maximum dimensions
 *
 * @param file - The original image file
 * @returns ResizeOutput with resized file or error
 *
 * If the image is already within limits, returns the original file.
 * Always outputs JPEG format for consistency.
 */
export async function resizeImage(file: File): Promise<ResizeOutput> {
  const originalSize = file.size;

  try {
    // Load the image to get dimensions
    const img = await loadImage(file);
    const { width: originalWidth, height: originalHeight } = img;

    // Check if resize is needed
    if (!needsResize(originalWidth, originalHeight)) {
      // Still convert to JPEG for consistency if not already
      if (file.type === RESIZE_CONFIG.OUTPUT_TYPE) {
        return {
          success: true,
          file,
          wasResized: false,
          originalSize,
          newSize: file.size,
        };
      }
    }

    // Calculate new dimensions
    const { width: newWidth, height: newHeight } = calculateNewDimensions(
      originalWidth,
      originalHeight
    );

    // Create canvas and resize
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        success: false,
        error: "Canvas context not available",
      };
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw resized image
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Convert to file
    const resizedFile = await canvasToFile(canvas, file.name);

    return {
      success: true,
      file: resizedFile,
      wasResized: true,
      originalSize,
      newSize: resizedFile.size,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resize image",
    };
  }
}
