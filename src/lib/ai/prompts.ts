/**
 * Prompt Templates for Dual-Output Generation
 *
 * Phase 8: Separate prompts for Player Card and World Scene
 * Phase 0 Card v2: Model generates character artwork ONLY (no frames/text/UI)
 *
 * CRITICAL: Each prompt must include the instruction to transform the input photo.
 * Without this, the model doesn't know what to do with the attached image.
 *
 * Output specifications:
 * - Player Card: Character artwork only, vertical, bust/shoulders (frames applied by app)
 * - World Scene: Horizontal landscape, full body, video game screenshot feel
 */

/**
 * Build the World Scene generation prompt
 *
 * Creates a PAUSED GAME SCREENSHOT feel:
 * - Must look like a real 16-bit video game, not an illustration
 * - Environment dominates (60-70% of frame)
 * - Character is grounded in the world, ready for action
 * - All people in the photo MUST be preserved
 *
 * @param sceneModifier - Environment/stage description from world definition
 * @param sceneCamera - Camera style from world definition
 * @returns Complete prompt for world scene generation
 */
export function buildWorldScenePrompt(
  sceneModifier: string,
  sceneCamera: string
): string {
  return `TRANSFORM this photo into a 16-bit video game screenshot.

THIS MUST LOOK LIKE A PAUSED GAME, NOT AN ILLUSTRATION.
The output should feel like pressing pause during gameplay on a SNES/GBA.

MANDATORY — PRESERVE ALL PEOPLE:
- Transform ALL people visible in the photo into pixel art
- Do NOT remove, replace, merge, or omit any person
- Same count, same poses, same placement as the original photo
- Each person must remain recognizable after pixelization

GAME SCREENSHOT COMPOSITION:
${sceneCamera}
- Environment DOMINATES the frame (60-70% of image)
- The world must be readable even if the character is removed
- Foreground elements add depth, midground is where character stands, background establishes scale
- Character shown full body or three-quarter body, feet grounded
- Character pose implies READINESS, not mid-action (ready for a fight, awaiting a quest, on watch)

PIXEL ART STYLE:
- Crisp 16-bit SNES-era pixel art with visible pixel blocks
- Hard edges, NO smooth gradients, NO painterly shading
- Limited color palette (max 16 colors), mild dithering allowed
- NO photo-realism, NO illustration style, NO cinematic lighting

WORLD THEME — THIS IS THE GAME STAGE:
${sceneModifier}

LANDSCAPE FORMAT:
- Horizontal image (wider than tall)
- 16:9 aspect ratio

OUTPUT:
Generate ONLY the pixel-art game screenshot.
No text. No UI. No menus. No explanations.`;
}

/**
 * Build the Player Card generation prompt
 *
 * Card v2: Model generates ONLY character artwork (FULL-BLEED).
 * Frames, text, and UI are applied by the app layer.
 *
 * IMPORTANT: AI must NOT generate text, frames, or UI elements.
 * The app composites frame PNG and pixel-font text on top of the artwork.
 * This separation ensures crisp, consistent typography and controllable stats.
 *
 * @param cardModifier - Style guidance from world definition (e.g., "neon alley, graffiti")
 * @returns Complete prompt for player card generation
 */
export function buildPlayerCardPrompt(cardModifier: string): string {
  return `PIXEL-ART CONVERSION: Transform this photo into a 16-bit video game character sprite.

CRITICAL — THE PERSON MUST BECOME PIXEL ART:
- The actual person/people in this photo MUST be converted to pixel art
- Do NOT paste the original photo onto a pixel background
- Do NOT keep photorealistic faces or bodies — EVERYTHING becomes pixels
- The subject must look like a character sprite from SNES/GBA games
- Visible pixel blocks on skin, hair, clothing — NO smooth photorealistic areas

PRESERVE ALL SUBJECTS:
- Keep the same number of people, same poses, same placement
- Each person becomes a pixel art character, but remains recognizable
- Animals or objects in the photo also become pixel art

PIXEL ART STYLE (MANDATORY):
- Crisp 16-bit pixel art with VISIBLE PIXEL BLOCKS everywhere
- Hard edges, NO anti-aliasing, NO smooth gradients
- Limited palette (max 16 colors), dithering for shading
- Must look like a sprite ripped from a retro game cartridge
- NO photo-realism anywhere — not faces, not clothes, not background

COMPOSITION:
- Portrait orientation (taller than wide)
- Head and shoulders OR half-body framing
- Leave headroom at top
- Full-bleed: artwork fills entire canvas

WORLD THEME FOR BACKGROUND:
${cardModifier}
- Background environment matches this theme
- Character integrated into the themed world

DO NOT INCLUDE:
- NO text, NO titles, NO labels
- NO frames, NO borders, NO UI
- NO photorealistic elements

OUTPUT: Pure pixel-art image only.`;
}
