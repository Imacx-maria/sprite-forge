/**
 * World Definition Type
 * Phase 6: Data contract for world themes
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
  /** Additive style guidance for generation prompt */
  promptModifier: string;
}
