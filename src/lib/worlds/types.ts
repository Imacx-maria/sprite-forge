/**
 * World System Types
 * Phase 6: World Selection for prompt variation
 */

export interface World {
  /** Unique identifier */
  id: string;
  /** Display name shown in UI */
  displayName: string;
  /** Short description for selection UI */
  description: string;
  /** Icon/emoji for visual identification */
  icon: string;
  /** Prompt modifier appended to base generation prompt */
  promptModifier: string;
}

export type WorldId =
  | 'fantasy-rpg'
  | 'street-brawler'
  | 'space-marine'
  | 'gothic-hunter'
  | 'candy-land'
  | 'galactic-overlord';
