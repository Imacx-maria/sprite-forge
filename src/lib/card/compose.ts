/**
 * Card Composition Utility
 *
 * DEPRECATED: Frame and text overlay composition has been removed.
 * The AI now generates complete card images directly.
 *
 * This file remains for:
 * - downloadCard() utility function
 * - composePlayerCard() which now passes through the image unchanged
 *
 * Legacy composition logic (frame, title, name, stats) has been removed.
 * The AI generates the complete card image with all visual elements included.
 */

import {
  DEFAULT_CHARACTER,
  type CharacterData,
} from "./types";

/**
 * Compose a complete Player Card
 *
 * DEPRECATED: Frame and text overlays have been removed.
 * The AI now generates the complete card image directly.
 * This function validates input and returns the image as-is.
 *
 * @param characterImageSrc - Data URL or URL of the AI-generated card image
 * @param _character - DEPRECATED: Character data is no longer used
 * @returns Data URL of the card image (unchanged from input)
 * @throws Error if character image is missing or invalid
 */
export async function composePlayerCard(
  characterImageSrc: string,
  _character: CharacterData = DEFAULT_CHARACTER
): Promise<string> {
  // Validate input — do NOT silently fall back to placeholder
  if (!characterImageSrc) {
    throw new Error(
      "Cannot compose card: character image source is missing or empty"
    );
  }

  // DEPRECATED: Frame and text overlays removed
  // The AI generates the complete card image — return as-is
  return characterImageSrc;
}

/**
 * Trigger download of the card as PNG
 */
export function downloadCard(dataUrl: string, filename: string = "player-card.png"): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
