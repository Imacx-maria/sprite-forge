/**
 * V2 Feature Flags
 *
 * Controls V1 vs V2 behavior during transition.
 * V2: AI generates complete card images (frame + text + stats).
 * V1: App composites frame/text/stats locally via composePlayerCard().
 */

/**
 * V2 Mode Active
 *
 * When true:
 * - PlayerCard renders AI-generated image directly (no local composition)
 * - composePlayerCard() is bypassed
 * - framePath is not used
 *
 * When false (default):
 * - V1 behavior: PlayerCard calls composePlayerCard() for local frame/text overlay
 *
 * Set via environment variable: NEXT_PUBLIC_V2_MODE=true
 */
export const V2_MODE_ACTIVE = process.env.NEXT_PUBLIC_V2_MODE === "true";

/**
 * Check if V2 mode is enabled
 */
export function isV2ModeActive(): boolean {
    return V2_MODE_ACTIVE;
}
