/**
 * Worlds API Route — V2
 * GET /api/worlds — Returns list of world summaries for client selection
 */

import { NextResponse } from "next/server";
import { getWorldSummaries } from "@/lib/worlds";

/**
 * GET /api/worlds
 * Returns a JSON list of world summaries for the WorldSelector component
 */
export async function GET() {
  try {
    const summaries = getWorldSummaries();

    if (summaries.length === 0) {
      return NextResponse.json(
        { error: "No worlds configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      worlds: summaries,
      count: summaries.length,
    });
  } catch (error) {
    console.error("[api/worlds] Error loading worlds:", error);
    return NextResponse.json(
      { error: "Failed to load worlds" },
      { status: 500 }
    );
  }
}
