/**
 * Player Card Types
 *
 * Phase 5: Type definitions for card composition
 * Phase 0 Final: Card type title, player name, and stats
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
    Y: 140,
    WIDTH: 896,
    HEIGHT: 1100,
  },
  /** Frame border width */
  BORDER_WIDTH: 16,
  /**
   * Text layout — Bold pixel font sizes for arcade card feel
   *
   * Card type: 120px at top center (big header)
   * Stats: Top right corner of image area (POWER/SPEED stacked)
   * Name: 200px near bottom but higher up
   *
   * Font: VT323 (pixel/bitmap style per identity.md)
   */
  TEXT: {
    // Card title (top center, inside frame header area)
    CARD_TYPE_Y: 68,
    CARD_TYPE_FONT_SIZE: 72,
    // Player name (bottom area, inside frame footer)
    NAME_Y: 1310,
    NAME_FONT_SIZE: 100,
    // Stats (top right corner of image area)
    STATS_X: 940,
    STATS_Y_POWER: 200,
    STATS_Y_SPEED: 250,
    STATS_FONT_SIZE: 36,
  },
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
  TEXT_SECONDARY: "#aaaaaa",
  TEXT_ACCENT: "#ffcc00",
} as const;

/**
 * Player stats for card
 */
export interface PlayerStats {
  POWER: number;
  SPEED: number;
}

/**
 * Character data for card overlays
 */
export interface CharacterData {
  /** Card type title (from world, e.g. "STREET BRAWLER CARD") */
  cardType: string;
  /** Player name (max 13 characters) */
  name: string;
  /** Player stats (POWER, SPEED) */
  stats: PlayerStats;
}

/**
 * Generate random stat value (60-99)
 */
export function generateRandomStat(): number {
  return Math.floor(Math.random() * 40) + 60;
}

/**
 * Generate random stats
 */
export function generateRandomStats(): PlayerStats {
  return {
    POWER: generateRandomStat(),
    SPEED: generateRandomStat(),
  };
}

/**
 * Auto-generated names (max 13 chars each)
 */
const AUTO_NAMES = [
  "PIXEL HERO",
  "SHADOW WOLF",
  "NEON BLADE",
  "STORM RIDER",
  "IRON FIST",
  "CYBER HAWK",
  "NOVA SPARK",
  "FROST BITE",
  "DARK HUNTER",
  "BLAZE FURY",
  "VOID DANCER",
  "THUNDER JAW",
  "STEEL VIPER",
  "GHOST STRIKE",
  "CRIMSON ACE",
  "WILD CARD",
];

/**
 * Generate a random player name (max 13 chars)
 */
export function generateRandomName(): string {
  const name = AUTO_NAMES[Math.floor(Math.random() * AUTO_NAMES.length)];
  return name.substring(0, 13);
}

/**
 * Enforce max name length
 */
export function enforceNameLimit(name: string): string {
  return name.substring(0, 13).toUpperCase();
}

/**
 * Default character with auto-generated values
 */
export function createDefaultCharacter(cardType: string): CharacterData {
  return {
    cardType,
    name: generateRandomName(),
    stats: generateRandomStats(),
  };
}

/**
 * Default character data (used when no character provided)
 */
export const DEFAULT_CHARACTER: CharacterData = {
  cardType: "PLAYER CARD",
  name: "",
  stats: { POWER: 80, SPEED: 80 },
};
