/**
 * Prompt Templates for Dual-Output Generation
 *
 * Phase 8: Separate prompts for Player Card and World Scene
 *
 * CRITICAL: Each prompt must include the instruction to transform the input photo.
 * Without this, the model doesn't know what to do with the attached image.
 *
 * Based on prompt-architecture.md specifications:
 * - Player Card: Vertical portrait, bust/shoulders, collectible card feel
 * - World Scene: Horizontal landscape, full body, video game screenshot feel
 */

/**
 * Build the World Scene generation prompt
 *
 * @param sceneModifier - Environment description from world definition
 * @param sceneCamera - Camera style from world definition
 * @returns Complete prompt for world scene generation
 */
export function buildWorldScenePrompt(
  sceneModifier: string,
  sceneCamera: string
): string {
  return `Transform this photo into a 16-bit pixel art video game screenshot.

Style requirements:
- SNES-era pixel art aesthetic
- Clean pixel art with visible pixels
- Simple color palette (max 16 colors)

Scene composition:
${sceneCamera}
Wide scene with detailed pixel environment.
Foreground, midground, and background depth.
Character shown full body or three-quarter body, standing firmly in the environment.

World Theme:
${sceneModifier}

Output: Landscape orientation 16:9.
Generate ONLY the pixel art image, no text or explanations.`;
}

/**
 * Build the Player Card generation prompt
 *
 * @param cardModifier - Style guidance from world definition
 * @returns Complete prompt for player card generation
 */
export function buildPlayerCardPrompt(cardModifier: string): string {
  return `Transform this photo into a 16-bit pixel art game character sprite.

Style requirements:
- 16-bit retro game aesthetic
- Clean pixel art with visible pixels
- Character should be centered
- Simple color palette (max 16 colors)
- Game-ready sprite appearance
- Transparent or solid color background

Card format:
Vertical orientation. Bust or shoulders portrait.
Simple background. Thick pixel frame aesthetic.
Retro game card feel. Readable at small size.

World Theme:
${cardModifier}

Generate ONLY the pixel art image, no text or explanations.`;
}
