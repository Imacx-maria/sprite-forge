import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/upload
 * Accept photo upload for server-side processing
 *
 * PHASE 4+ STUB — Not yet implemented
 *
 * NOTE: Phase 3 handles photos entirely client-side.
 * This endpoint may be used in Phase 4+ if server-side
 * image processing or temporary storage is needed.
 *
 * TODO Phase 4+:
 * - Accept multipart/form-data with image file
 * - Validate file type and size server-side
 * - Optionally store temporarily for processing
 * - Return upload confirmation
 */
export async function POST(request: NextRequest) {
  // Phase 4+: Server-side upload handling if needed
  return NextResponse.json(
    {
      message: "Upload endpoint - Phase 4+ stub",
      status: "not_implemented",
      note: "Phase 3 handles photos client-side only",
      phase: 4,
    },
    { status: 501 }
  );
}
