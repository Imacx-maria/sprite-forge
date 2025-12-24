import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/upload
 * Accept photo upload, hold in memory for generation
 *
 * TODO: Implement in Phase 1
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Upload endpoint - not yet implemented" },
    { status: 501 }
  );
}
