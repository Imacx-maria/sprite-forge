/**
 * Phase 11: World-based randomization pools for card and landscape generation
 */

export const HEARTS_POOL = [
  "♥ ♥ ♥",
  "♥ ♥ ♡",
  "♥ ♡ ♡",
  "♥ ♥ ♥ ♥ ♥",
  "♡ ♡ ♡",
  "♥ ♥ ♥ + ☆"
] as const;

export const SCORE_POOL = [
  "000000",
  "001337",
  "099999",
  "000420",
  "007700",
  "000001",
  "042069"
] as const;

export const LIVES_POOL = [
  "x00",
  "x01",
  "x02",
  "x03",
  "x99"
] as const;
