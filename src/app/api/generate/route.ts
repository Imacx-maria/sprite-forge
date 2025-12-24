import { NextRequest, NextResponse } from "next/server";
import {
  generatePixelArt,
  isConfigured,
  type GenerateImageResponse,
} from "@/lib/ai";

/**
 * POST /api/generate
 * Generate pixel-art character from uploaded photo
 *
 * Phase 4: AI generation via OpenRouter (Nano Banana model)
 *
 * Request body:
 * {
 *   imageData: string (base64, without data URL prefix),
 *   mimeType: string (e.g., "image/jpeg")
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   imageBase64?: string,
 *   mimeType?: string,
 *   error?: string,
 *   errorCode?: string
 * }
 *
 * NOTE: No images are persisted. All data lives only in request/response.
 */

interface GenerateRequestBody {
  imageData: string;
  mimeType: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if AI is configured
    if (!isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI generation is not configured. Please set OPENROUTER_API_KEY.",
          errorCode: "MISSING_API_KEY",
        } satisfies GenerateImageResponse,
        { status: 503 }
      );
    }

    // Parse request body
    let body: GenerateRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          errorCode: "INVALID_REQUEST",
        } satisfies GenerateImageResponse,
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.imageData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing imageData field",
          errorCode: "INVALID_REQUEST",
        } satisfies GenerateImageResponse,
        { status: 400 }
      );
    }

    if (!body.mimeType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing mimeType field",
          errorCode: "INVALID_REQUEST",
        } satisfies GenerateImageResponse,
        { status: 400 }
      );
    }

    // Validate mime type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(body.mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid image type. Allowed: ${allowedTypes.join(", ")}`,
          errorCode: "INVALID_REQUEST",
        } satisfies GenerateImageResponse,
        { status: 400 }
      );
    }

    // Generate pixel art
    // NOTE: This does NOT persist the image anywhere
    const result = await generatePixelArt(body.imageData, body.mimeType);

    // Return result
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      // Map error codes to HTTP status codes
      const statusMap: Record<string, number> = {
        MISSING_API_KEY: 503,
        INVALID_REQUEST: 400,
        RATE_LIMIT: 429,
        TIMEOUT: 504,
        API_ERROR: 502,
        GENERATION_FAILED: 500,
        UNKNOWN: 500,
      };

      const status = statusMap[result.errorCode || "UNKNOWN"] || 500;
      return NextResponse.json(result, { status });
    }
  } catch (error) {
    // Unexpected error - log but don't expose details
    console.error("[/api/generate] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        errorCode: "UNKNOWN",
      } satisfies GenerateImageResponse,
      { status: 500 }
    );
  }
}
