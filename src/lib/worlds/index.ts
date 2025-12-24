/**
 * World Definitions Index
 * Phase 6: Exports all world data
 */

export type { WorldDefinition } from "./types";

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
 * World ID type derived from available worlds
 */
export type WorldId = (typeof WORLDS)[number]["id"];

/**
 * Default world ID for initial state
 */
export const DEFAULT_WORLD_ID: WorldId = "fantasy-rpg";
