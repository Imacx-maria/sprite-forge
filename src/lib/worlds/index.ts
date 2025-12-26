/**
 * World Definitions Index
 * Phase 6: Exports all world data and accessors
 */

import type { WorldDefinition } from "./types";
export type { WorldDefinition } from "./types";
export { getRandomCardTitle } from "./types";

import { fantasyRpg } from "./fantasy-rpg";
import { streetBrawler } from "./street-brawler";
import { spaceMarine } from "./space-marine";
import { gothicHunter } from "./gothic-hunter";
import { candyLand } from "./candy-land";
import { galacticOverlord } from "./galactic-overlord";

/**
 * All available worlds in display order
 */
export const WORLDS = [
  fantasyRpg,
  streetBrawler,
  spaceMarine,
  gothicHunter,
  candyLand,
  galacticOverlord,
] as const;

/**
 * World type alias for WorldDefinition
 */
export type World = WorldDefinition;

/**
 * World ID type derived from available worlds
 */
export type WorldId = (typeof WORLDS)[number]["id"];

/**
 * Default world ID for initial state
 */
export const DEFAULT_WORLD_ID: WorldId = "fantasy-rpg";

/**
 * Get all available worlds
 */
export function getAllWorlds(): readonly WorldDefinition[] {
  return WORLDS;
}

/**
 * Get a world by its ID
 * @throws Error if world ID is not found
 */
export function getWorld(id: WorldId): WorldDefinition {
  const world = WORLDS.find((w) => w.id === id);
  if (!world) {
    throw new Error(`World not found: ${id}`);
  }
  return world;
}
