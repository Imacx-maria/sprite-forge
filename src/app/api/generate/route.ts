import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate
 * Generate World Scene and Player Card from uploaded photo
 *
 * PHASE 4+ STUB — Not yet implemented
 *
 * TODO Phase 4:
 * - Accept base64 image data + world/style selection
 * - Validate request body (GenerationRequest type)
 * - Call Replicate API for sprite generation
 * - Generate World Scene
 * - Generate Player Card
 * - Return generated images or stream progress
 *
 * Expected request body (Phase 4):
 * {
 *   imageData: string (base64),
 *   source: "upload" | "webcam",
 *   fileName: string,
 *   style?: string
 * }
 */
export async function POST(request: NextRequest) {
  // Phase 4+: This will be implemented with Replicate API
  return NextResponse.json(
    {
      message: "Generate endpoint - Phase 4+ stub",
      status: "not_implemented",
      phase: 4,
    },
    { status: 501 }
  );
}
