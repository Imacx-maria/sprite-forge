/**
 * World Definition Type
 * Phase 6: Data contract for world themes
 * Phase 8: Extended for dual-output generation (Player Card + World Scene)
 */

export interface WorldDefinition {
  /** Unique identifier for the world */
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
}

/**
 * Get a random card title from the world's available titles
 */
export function getRandomCardTitle(world: WorldDefinition): string {
  const titles = world.cardTitles;
  return titles[Math.floor(Math.random() * titles.length)];
}
