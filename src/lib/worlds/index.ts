/**
 * Phase 11: World-based randomization pools for card and landscape generation
 */

export * from './types';
export * from './ui-pools';

export { theEscape } from './definitions/the-escape';
export { wallOfFire } from './definitions/wall-of-fire';
export { prisonPlanet } from './definitions/prison-planet';
export { theRpf } from './definitions/the-rpf';
export { surveillanceState } from './definitions/surveillance-state';
export { theAftermath } from './definitions/the-aftermath';

import {
  theEscape,
  wallOfFire,
  prisonPlanet,
  theRpf,
  surveillanceState,
  theAftermath,
} from './definitions';

import type { WorldDefinition, WorldSummary } from './types';

export { DEFAULT_WORLD_ID } from './constants';

export const ALL_WORLDS = [
  theEscape,
  wallOfFire,
  prisonPlanet,
  theRpf,
  surveillanceState,
  theAftermath,
] as const;

export const getWorldById = (id: string): WorldDefinition | undefined =>
  ALL_WORLDS.find(w => w.id === id);

/**
 * Get world summaries for UI selection
 */
export function getWorldSummaries(): WorldSummary[] {
  return ALL_WORLDS.map((world) => ({
    id: world.id,
    worldLabel: world.worldLabel,
    displayName: world.displayName,
    description: world.description,
    icon: world.icon,
    titles: world.titles,
  }));
}

/**
 * Get a random title from a world summary
 */
export function getRandomTitleFromSummary(world: WorldSummary): string {
  const titles = world.titles;
  return titles[Math.floor(Math.random() * titles.length)];
}

export { useWorlds } from "./use-worlds";
