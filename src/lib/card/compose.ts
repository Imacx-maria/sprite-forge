/**
 * Card Composition Utility
 *
 * Phase 5: Composes Player Card layers in-memory using canvas
 * Phase 8: Static frame assets per world
 * Phase 0 Final: Card type title, player name, and stats overlay (no backgrounds)
 *
 * - No disk persistence
 * - No external services
 * - Deterministic output
 *
 * FULL-BLEED DESIGN:
 * The AI-generated artwork fills the entire card canvas edge-to-edge.
 * NO app-added backgrounds behind the artwork.
 *
 * Composition order (CRITICAL):
 * 1. Full-bleed character artwork (COVER scaling, no letterbox)
 * 2. Frame overlay (static PNG per world)
 * 3. Text overlays (card type, name, stats - no background panels)
 *
 * AI does NOT generate text/frames — the app composites them on top.
 * This ensures crisp pixel-font typography and controllable stats.
 */

import {
  CARD_DIMENSIONS,
  CARD_COLORS,
  DEFAULT_CHARACTER,
  enforceNameLimit,
  generateRandomName,
  type CharacterData,
} from "./types";

/**
 * Pixel font for card text overlays
 * VT323 is the official SPRITE FORGE font (per identity.md)
 * Loaded via Next.js Google Fonts in layout.tsx
 */
const CARD_FONT = "VT323, monospace";

/**
 * Load an image from a data URL or URL
 * @throws Error if image fails to load or src is invalid
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Cannot load image: source is empty or undefined"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Failed to load image: invalid or inaccessible source"));
    img.src = src;
  });
}

/**
 * Draw image with COVER scaling (fills target area, crops overflow)
 *
 * FULL-BLEED: The artwork fills the entire canvas edge-to-edge.
 * No letterboxing, no pillarboxing, no background panels.
 *
 * Anchor controls which part of the image is preserved when cropping:
 * - anchorX: 0 = left edge, 0.5 = center, 1 = right edge
 * - anchorY: 0 = top edge, 0.5 = center, 1 = bottom edge
 *
 * For portraits, use anchorY=0.25 to preserve headroom (top-center crop).
 *
 * @param ctx - Canvas 2D context
 * @param img - Image to draw
 * @param targetX - Target area X position
 * @param targetY - Target area Y position
 * @param targetWidth - Target area width
 * @param targetHeight - Target area height
 * @param anchorX - Horizontal anchor (0-1), default 0.5 (center)
 * @param anchorY - Vertical anchor (0-1), default 0.5 (center)
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number,
  anchorX: number = 0.5,
  anchorY: number = 0.5
): void {
  const imgAspect = img.width / img.height;
  const targetAspect = targetWidth / targetHeight;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  // COVER scaling: scale = max(targetW/imgW, targetH/imgH)
  // This ensures the image covers the entire target area
  if (imgAspect > targetAspect) {
    // Image is wider than target - fit to height, crop sides
    drawHeight = targetHeight;
    drawWidth = drawHeight * imgAspect;
    // Apply horizontal anchor
    const overflow = drawWidth - targetWidth;
    offsetX = targetX - overflow * anchorX;
    offsetY = targetY;
  } else {
    // Image is taller than target - fit to width, crop top/bottom
    drawWidth = targetWidth;
    drawHeight = drawWidth / imgAspect;
    // Apply vertical anchor
    const overflow = drawHeight - targetHeight;
    offsetX = targetX;
    offsetY = targetY - overflow * anchorY;
  }

  // Clip to target area (prevents overflow)
  ctx.save();
  ctx.beginPath();
  ctx.rect(targetX, targetY, targetWidth, targetHeight);
  ctx.clip();

  // Draw image with COVER scaling
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  ctx.restore();
}

/**
 * Draw the character image FULL-BLEED (covers entire card canvas)
 *
 * NO background panels, NO letterboxing.
 * The AI artwork IS the card background.
 *
 * Uses TOP-CENTER anchor (anchorY=0.25) to preserve headroom for portraits.
 * This prevents cropping the top of heads when the image is taller than the card.
 */
function drawCharacterImageFullBleed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
): void {
  const { WIDTH, HEIGHT } = CARD_DIMENSIONS;

  // Disable image smoothing for crisp pixel art
  ctx.imageSmoothingEnabled = false;
  // Vendor prefixes for broader browser support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).mozImageSmoothingEnabled = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).webkitImageSmoothingEnabled = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).msImageSmoothingEnabled = false;

  // Draw full-bleed with TOP-CENTER anchor to preserve headroom
  // anchorX=0.5 (center horizontally), anchorY=0.25 (favor top, preserve heads)
  drawImageCover(ctx, img, 0, 0, WIDTH, HEIGHT, 0.5, 0.25);
}

/**
 * Draw the card frame overlay (legacy - canvas-drawn)
 * Phase 0 v2: Simplified frame without header/footer slabs
 */
function drawFrameLegacy(ctx: CanvasRenderingContext2D): void {
  const { WIDTH, HEIGHT, BORDER_WIDTH } = CARD_DIMENSIONS;

  // Outer frame border only
  ctx.strokeStyle = CARD_COLORS.FRAME_OUTER;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(
    BORDER_WIDTH / 2,
    BORDER_WIDTH / 2,
    WIDTH - BORDER_WIDTH,
    HEIGHT - BORDER_WIDTH
  );
}

/**
 * Draw the card frame from a static PNG asset
 * Phase 8: Use world-specific frame images
 */
async function drawFrameFromAsset(
  ctx: CanvasRenderingContext2D,
  framePath: string
): Promise<void> {
  const { WIDTH, HEIGHT } = CARD_DIMENSIONS;
  const frameImg = await loadImage(framePath);
  ctx.drawImage(frameImg, 0, 0, WIDTH, HEIGHT);
}

/**
 * Draw card type title at top of card
 * Phase 0 Final: Just text, no background panel
 */
function drawCardTypeTitle(
  ctx: CanvasRenderingContext2D,
  cardType: string
): void {
  const { WIDTH, TEXT } = CARD_DIMENSIONS;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = CARD_COLORS.TEXT_ACCENT;
  ctx.font = `${TEXT.CARD_TYPE_FONT_SIZE}px ${CARD_FONT}`;
  ctx.fillText(cardType.toUpperCase(), WIDTH / 2, TEXT.CARD_TYPE_Y);
}

/**
 * Draw player name near bottom of card
 * Phase 0 Final: Just text, no background panel
 * If name is empty, auto-generates one
 */
function drawPlayerName(
  ctx: CanvasRenderingContext2D,
  name: string
): void {
  const { WIDTH, TEXT } = CARD_DIMENSIONS;

  // Auto-generate name if empty
  const displayName = name.trim() || generateRandomName();
  const finalName = enforceNameLimit(displayName);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = CARD_COLORS.TEXT_PRIMARY;
  ctx.font = `${TEXT.NAME_FONT_SIZE}px ${CARD_FONT}`;
  ctx.fillText(finalName, WIDTH / 2, TEXT.NAME_Y);
}

/**
 * Draw player stats (POWER, SPEED) in top right corner of image area
 * Phase 0 Final: Stacked vertically, right-aligned
 */
function drawPlayerStats(
  ctx: CanvasRenderingContext2D,
  stats: { POWER: number; SPEED: number }
): void {
  const { TEXT } = CARD_DIMENSIONS;

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = CARD_COLORS.TEXT_SECONDARY;
  ctx.font = `${TEXT.STATS_FONT_SIZE}px ${CARD_FONT}`;

  // Draw POWER and SPEED stacked vertically in top right
  ctx.fillText(`POWER ${stats.POWER}`, TEXT.STATS_X, TEXT.STATS_Y_POWER);
  ctx.fillText(`SPEED ${stats.SPEED}`, TEXT.STATS_X, TEXT.STATS_Y_SPEED);
}

/**
 * Compose a complete Player Card
 *
 * Phase 8: Now supports static frame assets per world
 * Phase 0 Final: Card type title, player name, and stats (no background panels)
 *
 * FULL-BLEED DESIGN:
 * The AI-generated artwork fills the entire card canvas.
 * NO app-added backgrounds — the artwork IS the background.
 *
 * Draw order (CRITICAL):
 * 1. Full-bleed character artwork (COVER scaling)
 * 2. Frame overlay (static PNG per world)
 * 3. Text overlays (card type, name, stats)
 *
 * @param characterImageSrc - Data URL or URL of the generated character image
 * @param character - Character data (cardType, name, stats)
 * @param framePath - Path to static frame PNG (optional, falls back to canvas-drawn frame)
 * @returns Data URL of the composed PNG card
 * @throws Error if character image is missing or invalid
 */
export async function composePlayerCard(
  characterImageSrc: string,
  character: CharacterData = DEFAULT_CHARACTER,
  framePath?: string
): Promise<string> {
  const { WIDTH, HEIGHT } = CARD_DIMENSIONS;

  // Validate input — do NOT silently fall back to placeholder
  if (!characterImageSrc) {
    throw new Error(
      "Cannot compose card: character image source is missing or empty"
    );
  }

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Load character image (will throw if invalid)
  const characterImage = await loadImage(characterImageSrc);

  // Compose layers in order (CRITICAL ORDER)
  // =========================================

  // 1. FULL-BLEED character artwork (NO background behind it)
  //    The artwork fills the entire canvas edge-to-edge.
  //    NO drawBackground() call — we don't want any app-added backgrounds.
  drawCharacterImageFullBleed(ctx, characterImage);

  // 2. Frame overlay (static asset or legacy canvas-drawn)
  //    Frame is drawn ON TOP of the artwork.
  if (framePath) {
    await drawFrameFromAsset(ctx, framePath);
  } else {
    drawFrameLegacy(ctx);
  }

  // 3. Text overlays (no background panels)
  //    Text is drawn ON TOP of frame.
  drawCardTypeTitle(ctx, character.cardType);
  drawPlayerName(ctx, character.name);
  drawPlayerStats(ctx, character.stats);

  // Export as PNG data URL
  return canvas.toDataURL("image/png");
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
