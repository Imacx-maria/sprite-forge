/**
 * Card Composition Library
 *
 * Phase 5: Player Card generation
 * Phase 11: World-based randomization pools for card and landscape generation
 */

export { composePlayerCard, downloadCard } from "./compose";
export {
  CARD_DIMENSIONS,
  CARD_COLORS,
  DEFAULT_CHARACTER,
  generateRandomStat,
  generateRandomStats,
  generateRandomName,
  enforceNameLimit,
  createDefaultCharacter,
  type CharacterData,
  type PlayerStats,
} from "./types";

// Phase 11: World-based randomization
export * from './randomize';
