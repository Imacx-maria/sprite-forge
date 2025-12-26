import { NextRequest, NextResponse } from "next/server";
import {
  generatePixelArt,
  generateDualOutput,
  isConfigured,
  type GenerateImageResponse,
} from "@/lib/ai";
import { getWorldById } from "@/lib/worlds";

/**
 * POST /api/generate
 * Generate pixel-art character from uploaded photo
 *
 * Phase 4: AI generation via OpenRouter
 * Phase 6: World-based prompt modifiers
 * Phase 8: Dual-output generation (Player Card + World Scene)
 * V2: Uses YAML-based world loading
 *
 * Request body:
 * {
 *   imageData: string (base64, without data URL prefix),
 *   mimeType: string (e.g., "image/jpeg"),
 *   worldId?: string (world ID for dual generation),
 *   worldModifier?: string (LEGACY: optional world theme prompt modifier)
 * }
 *
 * Response (Phase 8 dual-output):
 * {
 *   success: boolean,
 *   cardImage?: { imageBase64: string, mimeType: string },
 *   worldSceneImage?: { imageBase64: string, mimeType: string },
 *   error?: string,
 *   errorCode?: string
 * }
 *
 * NOTE: No images are persisted. All data lives only in request/response.
 */

interface GenerateRequestBody {
  imageData: string;
  mimeType: string;
  worldId?: string; // V2: Now accepts any world ID string from YAML
  worldModifier?: string; // LEGACY: kept for backwards compatibility
  playerName?: string;
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

    // Phase 8 / V2: Use dual generation when worldId is provided
    // Phase 9: World is loaded from in-code definitions
    if (body.worldId) {
      const world = getWorldById(body.worldId);

      if (!world) {
        return NextResponse.json(
          {
            success: false,
            error: `World not found: ${body.worldId}`,
            errorCode: "INVALID_REQUEST",
          } satisfies GenerateImageResponse,
          { status: 400 }
        );
      }

      const result = await generateDualOutput(body.imageData, body.mimeType, world, {
        name: body.playerName,
      });

      // Return dual-output result
      if (result.success) {
        return NextResponse.json(result, { status: 200 });
      } else {
        const statusMap: Record<string, number> = {
          MISSING_API_KEY: 503,
          INVALID_REQUEST: 400,
          RATE_LIMIT: 429,
          TIMEOUT: 504,
          API_ERROR: 502,
          GENERATION_FAILED: 500,
          MODEL_RETURNED_TEXT: 422,
          UNKNOWN: 500,
        };

        const status = statusMap[result.errorCode || "UNKNOWN"] || 500;
        return NextResponse.json(result, { status });
      }
    }

    // LEGACY: Single-output mode for backwards compatibility
    const result = await generatePixelArt(
      body.imageData,
      body.mimeType,
      body.worldModifier
    );

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
        MODEL_RETURNED_TEXT: 422,
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
