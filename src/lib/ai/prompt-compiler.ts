/**
 * Prompt Compiler — V2 Centralized Prompt Assembly
 *
 * Compiles prompts from WorldSpec and user input for generation.
 * This is the single source of truth for prompt construction.
 */

import type {
  WorldDefinition,
  StatPool,
  UIElementPool,
  GeneratedCardContent,
  GeneratedLandscapeUI,
} from "@/lib/worlds/types";
import { OUTPUT_DIMENSIONS } from "./types";

/**
 * Output type for generation
 */
export type OutputType = "card" | "scene";

/**
 * Target size for image generation
 */
export interface TargetSize {
  width: number;
  height: number;
}

/**
 * Compiled prompt result
 */
export interface CompiledPrompt {
  prompt: string;
  targetSize: TargetSize;
  aspectRatio: string;
}

/**
 * User input for prompt compilation
 */
export interface PromptInput {
  /** Player name (optional) */
  name?: string;
  /** Selected card title (optional, will be picked randomly if not provided) */
  cardTitle?: string;
  /** Selected card content (title/class/stats) */
  cardContent?: GeneratedCardContent;
  /** Selected scene HUD UI elements */
  sceneUI?: GeneratedLandscapeUI;
}

/**
 * Hardening suffix appended on retry to enforce output quality
 */
export const HARDENING_SUFFIX = `
CRITICAL OUTPUT RULES:
- NO placeholders, NO template tokens, NO {brackets}
- Render ALL text as final, readable pixel text
- Correct aspect ratio as specified
- Pure pixel-art output only`;

/**
 * Build the World Scene generation prompt
 *
 * Creates a PAUSED GAME SCREENSHOT feel:
 * - Must look like a real 16-bit video game, not an illustration
 * - Environment dominates (60-70% of frame)
 * - Character is grounded in the world, ready for action
 */
function formatCardTextSpec(
  name?: string,
  cardContent?: GeneratedCardContent
): string {
  if (!name && !cardContent) {
    return "";
  }

  const lines: string[] = ["CARD TEXT TO RENDER (EXACT):"];

  if (name) {
    lines.push(`Player Name: ${name}`);
  }

  if (cardContent) {
    lines.push(`Card Title: ${cardContent.title}`);
    lines.push(`Class: ${cardContent.classLabel}`);
    lines.push("Stats:");
    cardContent.stats.forEach(stat => {
      lines.push(`- ${stat.label}: ${stat.value}`);
    });
  }

  lines.push("Render text exactly as written. Do NOT invent or alter characters.");
  return lines.join("\n");
}

function formatSceneHudSpec(sceneUI?: GeneratedLandscapeUI): string {
  if (!sceneUI) {
    return "";
  }

  const extraText = sceneUI.extra
    ? `${sceneUI.extra.label}: ${sceneUI.extra.value}`
    : "NONE";

  return [
    "HUD TEXT TO RENDER (EXACT):",
    `Hearts: ${sceneUI.hearts}`,
    `Score: ${sceneUI.score}`,
    `Lives: ${sceneUI.lives}`,
    `Extra: ${extraText}`,
    "Render HUD text/icons exactly as written. Do NOT invent or alter characters.",
  ].join("\n");
}

function buildScenePrompt(world: WorldDefinition, input?: PromptInput): string {
  const hudSpec = formatSceneHudSpec(input?.sceneUI);
  const hudBlock = hudSpec ? `\n${hudSpec}\n` : "";

  return `TRANSFORM this photo into a 16-bit video game screenshot.

THIS MUST LOOK LIKE A PAUSED GAME, NOT AN ILLUSTRATION.
The output should feel like pressing pause during gameplay on a SNES/GBA.

MANDATORY — PRESERVE ALL PEOPLE:
- Transform ALL people visible in the photo into pixel art
- Do NOT remove, replace, merge, or omit any person
- Same count, same poses, same placement as the original photo
- Each person must remain recognizable after pixelization

GAME SCREENSHOT COMPOSITION:
${world.sceneCamera}
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

WORLD THEME - THIS IS THE GAME STAGE:
${world.scenePromptModifier}

LANDSCAPE FORMAT:
- Horizontal image (wider than tall)
- 16:9 aspect ratio

SCENE HUD RENDERING (MANDATORY):
- Render a retro-style HUD overlay on top of the scene
- HUD MUST include: Hearts, Score, Lives, and an optional extra UI element
- HUD elements must be crisp, readable pixel-art text/icons
- Position HUD at screen edges (top corners or bottom bar)
- If HUD elements are not visible, the output is INVALID
${hudBlock}

OUTPUT:
Generate ONLY the pixel-art game screenshot.
No explanations.`;
}

/**
 * Build the Player Card generation prompt
 *
 * Card v2: Model generates ONLY character artwork (FULL-BLEED).
 * Frames, text, and UI are applied by the app layer.
 */
function buildCardPrompt(world: WorldDefinition, input?: PromptInput): string {
  const cardTextSpec = formatCardTextSpec(input?.name, input?.cardContent);
  const cardTextBlock = cardTextSpec ? `\n${cardTextSpec}\n` : "";

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

CARD UI RENDERING (MANDATORY):
- Render a FULL collectible game card image
- Card MUST visibly display pixel-art text UI showing:
  - The card title (large and readable)
  - The class label
  - The player name
  - ALL FOUR stats
- Stats MUST be drawn as visible pixel-art UI (text, bars, or stat panels)
- If stats are not clearly visible on the card, the output is INVALID

BRANDING RESTRICTION:
- NO logos, NO brand marks, NO company names
${cardTextBlock}

WORLD THEME FOR BACKGROUND:
${world.promptModifier}
- Background environment matches this theme
- Character integrated into the themed world

DO NOT INCLUDE:
- NO photorealistic elements

OUTPUT: Pure pixel-art image only.`;
}

/**
 * Compile a prompt for the specified output type
 *
 * @param world - WorldSpec from YAML
 * @param input - User input (name, etc.)
 * @param outputType - "card" or "scene"
 * @returns Compiled prompt with target size and aspect ratio
 */
export function compilePrompt(
  world: WorldDefinition,
  input: PromptInput,
  outputType: OutputType
): CompiledPrompt {
  if (outputType === "scene") {
    return {
      prompt: buildScenePrompt(world, input),
      targetSize: {
        width: world.sceneDimensions?.width ?? OUTPUT_DIMENSIONS.SCENE.WIDTH,
        height: world.sceneDimensions?.height ?? OUTPUT_DIMENSIONS.SCENE.HEIGHT,
      },
      aspectRatio: world.sceneAspectRatio ?? "16:9",
    };
  }

  // Card prompt
  return {
    prompt: buildCardPrompt(world, input),
    targetSize: {
      width: world.cardDimensions?.width ?? OUTPUT_DIMENSIONS.CARD.WIDTH,
      height: world.cardDimensions?.height ?? OUTPUT_DIMENSIONS.CARD.HEIGHT,
    },
    aspectRatio: world.cardAspectRatio ?? "3:4",
  };
}

/**
 * Add hardening suffix to a prompt for retry attempts
 */
export function hardenPrompt(prompt: string): string {
  return `${prompt}${HARDENING_SUFFIX}`;
}

// ============================================================================
// SPRITE FORGE V2 CONTENT GENERATION PROMPT COMPILER
// ============================================================================

/**
 * Canonical prompt template for V2 content generation
 * DO NOT MODIFY THIS TEMPLATE
 */
const CANONICAL_PROMPT_TEMPLATE = `You are generating content for SPRITE FORGE V2.

You MUST generate BOTH:
1) A player card image
2) A world scene image

You MUST also return structured JSON describing the card and scene.

=========================
WORLD CONTEXT
=========================
World Name: {{world.displayName}}
World Label: {{world.worldLabel}}

World Description:
{{world.description}}

Camera & Scene Style:
{{world.sceneCamera}}

Visual Modifiers:
{{world.promptModifier}}
{{world.scenePromptModifier}}

=========================
CARD CONTENT RULES
=========================
Choose EXACTLY ONE card title from:
{{world.titles}}

Choose EXACTLY ONE class from:
{{world.classes}}

Choose EXACTLY FOUR (4) stats.
Each stat must:
- Use one stat label from a stat pool
- Use one value from the SAME pool
- Use each stat pool at most once

Available Stat Pools:
{{world.statPools}}

=========================
CARD VISUAL RENDERING (MANDATORY)
=========================
Render a FULL collectible game card image.

The card image MUST visibly display pixel-art text UI showing:
- The selected card title (large and readable)
- The selected class label
- ALL FOUR stats

Stats MUST be DRAWN as visible pixel-art UI:
- Text
- Bars
- Or stat panels

If stats are not clearly visible on the card,
the output is INVALID.

=========================
SCENE CONTENT RULES
=========================
Generate a pixel-art game scene.

=========================
SCENE HUD RENDERING (MANDATORY)
=========================
Render the scene as a paused retro video game screenshot.

A HUD MUST be visibly overlaid on top of the scene.
The HUD MUST include:
- Hearts
- Score
- Lives
- Optional world-specific UI element (if provided)

HUD elements MUST be pixel-art text/icons
positioned at the top or corners of the image.

If HUD elements are not visible,
the output is INVALID.

=========================
INTENT MODIFIERS (OPTIONAL)
=========================
Emphasis: {{intent.statFocus}}
Intensity: {{intent.intensity}}
UI Density: {{intent.uiDensity}}

Use these only as subtle guidance.

=========================
OUTPUT RULES
=========================
- Do NOT invent titles, classes, stat labels, or values
- Do NOT explain your choices
- Do NOT add extra text

=========================
OUTPUT FORMAT (STRICT JSON)
=========================
Return ONLY valid JSON:

{
  "card": {
    "title": string,
    "class": string,
    "stats": [
      { "label": string, "value": string },
      { "label": string, "value": string },
      { "label": string, "value": string },
      { "label": string, "value": string }
    ]
  },
  "scene": {
    "description": string,
    "ui": {
      "hearts": string,
      "score": string,
      "lives": string,
      "extra": { "label": string, "value": string } | null
    }
  }
}

RULE:
If something appears in the JSON,
it MUST be VISIBLY DRAWN in the image.`;

// ============================================================================
// FORMATTING HELPERS (V2 Content Generation)
// ============================================================================

/**
 * Format an array of strings as a bullet list
 */
function formatList(items: string[]): string {
  return items.map(item => `- ${item}`).join('\n');
}

/**
 * Format stat pools as "LABEL: value | value | value"
 */
function formatStatPools(pools: StatPool[]): string {
  return pools
    .map(pool => `${pool.label}: ${pool.values.join(' | ')}`)
    .join('\n');
}

/**
 * Format UI element pools as "LABEL: value | value | value"
 */
function formatUIPools(pools: UIElementPool[]): string {
  return pools
    .map(pool => `${pool.label}: ${pool.values.join(' | ')}`)
    .join('\n');
}

// ============================================================================
// V2 CONTENT PROMPT COMPILER
// ============================================================================

export interface SpriteForgePromptParams {
  world: WorldDefinition;
  intent?: {
    statFocus?: string;
    intensity?: string;
    uiDensity?: string;
  };
}

/**
 * Build a fully-hydrated SPRITE FORGE V2 content generation prompt
 *
 * @param params - World definition and optional intent modifiers
 * @returns Hydrated prompt string ready for AI
 */
export function buildSpriteForgePrompt(params: SpriteForgePromptParams): string {
  const { world, intent = {} } = params;

  // Intent defaults
  const statFocus = intent.statFocus ?? 'NONE';
  const intensity = intent.intensity ?? 'NORMAL';
  const uiDensity = intent.uiDensity ?? 'NORMAL';

  // Start with template
  let prompt = CANONICAL_PROMPT_TEMPLATE;

  // Replace scalar world fields
  prompt = prompt.replace('{{world.displayName}}', world.displayName);
  prompt = prompt.replace('{{world.worldLabel}}', world.worldLabel);
  prompt = prompt.replace('{{world.description}}', world.description);
  prompt = prompt.replace('{{world.sceneCamera}}', world.sceneCamera);
  prompt = prompt.replace('{{world.promptModifier}}', world.promptModifier);
  prompt = prompt.replace('{{world.scenePromptModifier}}', world.scenePromptModifier);

  // Replace formatted array fields
  prompt = prompt.replace('{{world.titles}}', formatList(world.titles));
  prompt = prompt.replace('{{world.classes}}', formatList(world.classes));
  prompt = prompt.replace('{{world.statPools}}', formatStatPools(world.statPools));
  prompt = prompt.replace('{{world.uiExtras}}', formatUIPools(world.uiExtras));

  // Replace intent fields
  prompt = prompt.replace('{{intent.statFocus}}', statFocus);
  prompt = prompt.replace('{{intent.intensity}}', intensity);
  prompt = prompt.replace('{{intent.uiDensity}}', uiDensity);

  return prompt;
}
