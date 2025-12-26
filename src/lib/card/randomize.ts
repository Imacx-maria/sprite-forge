/**
 * Phase 11: World-based randomization pools for card and landscape generation
 */

import type {
  WorldDefinition,
  GeneratedCardContent,
  GeneratedLandscapeUI,
  StatPool
} from '../worlds/types';

import {
  HEARTS_POOL,
  SCORE_POOL,
  LIVES_POOL
} from '../worlds/ui-pools';

function pickRandom<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle<T>(array: readonly T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomStats(
  pools: readonly StatPool[],
  count: number
) {
  return shuffle(pools)
    .slice(0, count)
    .map(pool => ({
      label: pool.label,
      value: pickRandom(pool.values)
    }));
}

export function generateCardContent(
  world: WorldDefinition
): GeneratedCardContent {
  return {
    title: pickRandom(world.titles),
    classLabel: pickRandom(world.classes),
    stats: pickRandomStats(world.statPools, 4) // ALWAYS 4
  };
}

export function generateLandscapeUI(
  world: WorldDefinition
): GeneratedLandscapeUI {
  const extraPool = pickRandom(world.uiExtras);

  return {
    hearts: pickRandom(HEARTS_POOL),
    score: pickRandom(SCORE_POOL),
    lives: pickRandom(LIVES_POOL),
    extra: {
      label: extraPool.label,
      value: pickRandom(extraPool.values)
    }
  };
}

export function generateAllContent(world: WorldDefinition) {
  return {
    card: generateCardContent(world),
    landscape: generateLandscapeUI(world)
  };
}
