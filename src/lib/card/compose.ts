/**
 * Card Composition Utility
 *
 * Phase 5: Composes Player Card layers in-memory using canvas
 * - No disk persistence
 * - No external services
 * - Deterministic output
 *
 * Composition order:
 * 1. Background
 * 2. Generated character image
 * 3. Frame overlay
 * 4. Text overlays
 */

import {
  CARD_DIMENSIONS,
  CARD_COLORS,
  DEFAULT_CHARACTER,
  type CharacterData,
} from "./types";

/**
 * Load an image from a data URL or URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw the card background
 */
function drawBackground(ctx: CanvasRenderingContext2D): void {
  const { WIDTH, HEIGHT } = CARD_DIMENSIONS;

  // Solid dark background
  ctx.fillStyle = CARD_COLORS.BACKGROUND;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle grid pattern for retro feel
  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 1;
  const gridSize = 32;

  for (let x = 0; x <= WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  for (let y = 0; y <= HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
}

/**
 * Draw the character image centered in the window
 */
function drawCharacterImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
): void {
  const { IMAGE_WINDOW } = CARD_DIMENSIONS;

  // Calculate scaling to fit image in window (cover, centered)
  const imgAspect = img.width / img.height;
  const windowAspect = IMAGE_WINDOW.WIDTH / IMAGE_WINDOW.HEIGHT;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imgAspect > windowAspect) {
    // Image is wider - fit to height, crop sides
    drawHeight = IMAGE_WINDOW.HEIGHT;
    drawWidth = drawHeight * imgAspect;
    offsetX = IMAGE_WINDOW.X + (IMAGE_WINDOW.WIDTH - drawWidth) / 2;
    offsetY = IMAGE_WINDOW.Y;
  } else {
    // Image is taller - fit to width, crop top/bottom
    drawWidth = IMAGE_WINDOW.WIDTH;
    drawHeight = drawWidth / imgAspect;
    offsetX = IMAGE_WINDOW.X;
    offsetY = IMAGE_WINDOW.Y + (IMAGE_WINDOW.HEIGHT - drawHeight) / 2;
  }

  // Clip to window area
  ctx.save();
  ctx.beginPath();
  ctx.rect(
    IMAGE_WINDOW.X,
    IMAGE_WINDOW.Y,
    IMAGE_WINDOW.WIDTH,
    IMAGE_WINDOW.HEIGHT
  );
  ctx.clip();

  // Draw image
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  ctx.restore();
}

/**
 * Draw the card frame overlay
 */
function drawFrame(ctx: CanvasRenderingContext2D): void {
  const { WIDTH, HEIGHT, IMAGE_WINDOW, BORDER_WIDTH } = CARD_DIMENSIONS;

  // Outer frame border
  ctx.strokeStyle = CARD_COLORS.FRAME_OUTER;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(
    BORDER_WIDTH / 2,
    BORDER_WIDTH / 2,
    WIDTH - BORDER_WIDTH,
    HEIGHT - BORDER_WIDTH
  );

  // Inner frame around image window
  const frameX = IMAGE_WINDOW.X - BORDER_WIDTH;
  const frameY = IMAGE_WINDOW.Y - BORDER_WIDTH;
  const frameW = IMAGE_WINDOW.WIDTH + BORDER_WIDTH * 2;
  const frameH = IMAGE_WINDOW.HEIGHT + BORDER_WIDTH * 2;

  // Shadow (bottom-right)
  ctx.strokeStyle = CARD_COLORS.FRAME_SHADOW;
  ctx.lineWidth = BORDER_WIDTH / 2;
  ctx.beginPath();
  ctx.moveTo(frameX + frameW, frameY);
  ctx.lineTo(frameX + frameW, frameY + frameH);
  ctx.lineTo(frameX, frameY + frameH);
  ctx.stroke();

  // Highlight (top-left)
  ctx.strokeStyle = CARD_COLORS.FRAME_HIGHLIGHT;
  ctx.beginPath();
  ctx.moveTo(frameX, frameY + frameH);
  ctx.lineTo(frameX, frameY);
  ctx.lineTo(frameX + frameW, frameY);
  ctx.stroke();

  // Main frame border
  ctx.strokeStyle = CARD_COLORS.FRAME_OUTER;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(frameX, frameY, frameW, frameH);

  // Corner decorations
  const cornerSize = 24;
  ctx.fillStyle = CARD_COLORS.FRAME_HIGHLIGHT;

  // Top-left corner
  ctx.fillRect(frameX - 4, frameY - 4, cornerSize, cornerSize);
  // Top-right corner
  ctx.fillRect(frameX + frameW - cornerSize + 4, frameY - 4, cornerSize, cornerSize);
  // Bottom-left corner
  ctx.fillRect(frameX - 4, frameY + frameH - cornerSize + 4, cornerSize, cornerSize);
  // Bottom-right corner
  ctx.fillRect(
    frameX + frameW - cornerSize + 4,
    frameY + frameH - cornerSize + 4,
    cornerSize,
    cornerSize
  );

  // Header area decoration
  ctx.fillStyle = CARD_COLORS.FRAME_INNER;
  ctx.fillRect(BORDER_WIDTH * 2, BORDER_WIDTH * 2, WIDTH - BORDER_WIDTH * 4, 120);

  // Header border
  ctx.strokeStyle = CARD_COLORS.FRAME_OUTER;
  ctx.lineWidth = 4;
  ctx.strokeRect(BORDER_WIDTH * 2, BORDER_WIDTH * 2, WIDTH - BORDER_WIDTH * 4, 120);
}

/**
 * Draw text overlays
 */
function drawTextOverlays(
  ctx: CanvasRenderingContext2D,
  character: CharacterData
): void {
  const { WIDTH, TITLE_Y, NAME_Y, CLASS_Y, STATS_Y } = CARD_DIMENSIONS;
  const centerX = WIDTH / 2;

  // Use pixel font style
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Title: "SPRITE FORGE"
  ctx.fillStyle = CARD_COLORS.TEXT_ACCENT;
  ctx.font = "bold 48px monospace";
  ctx.fillText("SPRITE FORGE", centerX, TITLE_Y);

  // Character name
  ctx.fillStyle = CARD_COLORS.TEXT_PRIMARY;
  ctx.font = "bold 56px monospace";
  ctx.fillText(character.name.toUpperCase(), centerX, NAME_Y);

  // Character class
  ctx.fillStyle = CARD_COLORS.TEXT_SECONDARY;
  ctx.font = "32px monospace";
  ctx.fillText(character.class.toUpperCase(), centerX, CLASS_Y);

  // Stats bars
  drawStatBars(ctx, character, STATS_Y);
}

/**
 * Draw stat bars
 */
function drawStatBars(
  ctx: CanvasRenderingContext2D,
  character: CharacterData,
  startY: number
): void {
  const { WIDTH } = CARD_DIMENSIONS;
  const barWidth = 160;
  const barHeight = 20;
  const spacing = 200;
  const stats = Object.entries(character.stats) as [string, number][];

  // Calculate starting X to center all bars
  const totalWidth = stats.length * spacing - (spacing - barWidth);
  const startX = (WIDTH - totalWidth) / 2;

  stats.forEach(([stat, value], index) => {
    const x = startX + index * spacing;
    const y = startY;

    // Stat label
    ctx.fillStyle = CARD_COLORS.TEXT_SECONDARY;
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText(stat, x + barWidth / 2, y - 20);

    // Bar background
    ctx.fillStyle = CARD_COLORS.STAT_BAR_BG;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Bar fill (based on value, max 100)
    const fillWidth = (value / 100) * barWidth;
    ctx.fillStyle = CARD_COLORS.STAT_BAR_FILL;
    ctx.fillRect(x, y, fillWidth, barHeight);

    // Bar border
    ctx.strokeStyle = CARD_COLORS.FRAME_OUTER;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Value text
    ctx.fillStyle = CARD_COLORS.TEXT_PRIMARY;
    ctx.font = "bold 18px monospace";
    ctx.fillText(value.toString(), x + barWidth / 2, y + barHeight + 20);
  });
}

/**
 * Compose a complete Player Card
 *
 * @param characterImageSrc - Data URL or URL of the generated character image
 * @param character - Character data for text overlays (optional, uses defaults)
 * @returns Data URL of the composed PNG card
 */
export async function composePlayerCard(
  characterImageSrc: string,
  character: CharacterData = DEFAULT_CHARACTER
): Promise<string> {
  const { WIDTH, HEIGHT } = CARD_DIMENSIONS;

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Load character image
  const characterImage = await loadImage(characterImageSrc);

  // Compose layers in order
  // 1. Background
  drawBackground(ctx);

  // 2. Character image
  drawCharacterImage(ctx, characterImage);

  // 3. Frame overlay
  drawFrame(ctx);

  // 4. Text overlays
  drawTextOverlays(ctx, character);

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
