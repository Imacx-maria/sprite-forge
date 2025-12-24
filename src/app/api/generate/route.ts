import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate
 * Generate World Scene and Player Card from uploaded photo
 *
 * TODO: Implement in Phase 1
 * - Accept photo + world selection
 * - Call Replicate API for Character Core
 * - Generate World Scene
 * - Generate Player Card
 * - Stream results back
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Generate endpoint - not yet implemented" },
    { status: 501 }
  );
}
