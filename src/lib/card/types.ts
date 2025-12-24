/**
 * Player Card Types
 *
 * Phase 5: Type definitions for card composition
 */

/**
 * Card dimensions (fixed)
 */
export const CARD_DIMENSIONS = {
  WIDTH: 1024,
  HEIGHT: 1408,
  /** Image window area (where character is placed) */
  IMAGE_WINDOW: {
    X: 64,
    Y: 180,
    WIDTH: 896,
    HEIGHT: 896,
  },
  /** Frame border width */
  BORDER_WIDTH: 16,
  /** Text areas */
  TITLE_Y: 80,
  NAME_Y: 1140,
  CLASS_Y: 1200,
  STATS_Y: 1280,
} as const;

/**
 * Card color palette (retro gaming aesthetic)
 */
export const CARD_COLORS = {
  BACKGROUND: "#0a0a0a",
  FRAME_OUTER: "#444444",
  FRAME_INNER: "#222222",
  FRAME_HIGHLIGHT: "#666666",
  FRAME_SHADOW: "#111111",
  TEXT_PRIMARY: "#ffffff",
  TEXT_SECONDARY: "#888888",
  TEXT_ACCENT: "#ffcc00",
  STAT_BAR_BG: "#333333",
  STAT_BAR_FILL: "#44aa44",
} as const;

/**
 * Placeholder character data
 */
export interface CharacterData {
  name: string;
  class: string;
  stats: {
    STR: number;
    DEX: number;
    INT: number;
    VIT: number;
  };
}

/**
 * Default placeholder character
 */
export const DEFAULT_CHARACTER: CharacterData = {
  name: "PIXEL LEGEND",
  class: "DIGITAL WARRIOR",
  stats: {
    STR: 85,
    DEX: 72,
    INT: 68,
    VIT: 90,
  },
};
