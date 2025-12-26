/**
 * WorldSpec — YAML-based World Definition Type
 * V2: Source of truth for world definitions loaded from YAML files
 */

/**
 * World specification loaded from YAML
 * This is the V2 schema that replaces the hardcoded WorldDefinition
 */
export interface WorldSpec {
  /** Unique identifier for the world (snake_case) */
  id: string;
  /** Display name shown in UI */
  displayName: string;
  /** Short description of the world theme */
  description: string;
  /** Icon/emoji for visual identification */
  icon: string;
  /** Additive style guidance for Player Card generation prompt */
  promptModifier: string;
  /** Environment description for World Scene generation */
  scenePromptModifier: string;
  /** Camera style for World Scene (isometric, side-scroll, etc.) */
  sceneCamera: string;
  /** Card header text variations (randomly selected) */
  cardTitles: string[];
  /** Character class label for the card */
  classLabel: string;
  /** Path to static frame PNG asset */
  framePath: string;
  /** Optional: Card aspect ratio (e.g., "3:4") */
  cardAspectRatio?: string;
  /** Optional: Scene aspect ratio (e.g., "16:9") */
  sceneAspectRatio?: string;
  /** Optional: Card dimensions */
  cardDimensions?: {
    width: number;
    height: number;
  };
  /** Optional: Scene dimensions */
  sceneDimensions?: {
    width: number;
    height: number;
  };
}

/**
 * World summary for client-side world selection and rendering (API response)
 * V2: Extended to include all fields needed for client-side card rendering
 */
export interface WorldSummary {
  id: string;
  displayName: string;
  description: string;
  icon: string;
  framePath: string;
  /** Card header text variations (for random selection client-side) */
  cardTitles: string[];
  /** Character class label for the card */
  classLabel: string;
}

/**
 * Validation result for WorldSpec
 */
export interface WorldSpecValidation {
  ok: boolean;
  issues: string[];
}

/**
 * Get a random card title from the world's available titles
 */
export function getRandomCardTitle(world: WorldSpec): string {
  const titles = world.cardTitles;
  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Convert WorldSpec to WorldSummary for API responses
 */
export function toWorldSummary(spec: WorldSpec): WorldSummary {
  return {
    id: spec.id,
    displayName: spec.displayName,
    description: spec.description,
    icon: spec.icon,
    framePath: spec.framePath,
    cardTitles: spec.cardTitles,
    classLabel: spec.classLabel,
  };
}

/**
 * Get a random card title from a WorldSummary
 */
export function getRandomCardTitleFromSummary(world: WorldSummary): string {
  const titles = world.cardTitles;
  return titles[Math.floor(Math.random() * titles.length)];
}
