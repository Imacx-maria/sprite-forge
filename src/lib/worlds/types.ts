/**
 * World Definition Type
 * Phase 6: Data contract for world themes
 */

export interface WorldDefinition {
  /** Unique identifier for the world */
  id: string;
  /** Display label shown in UI */
  label: string;
  /** Short description of the world theme */
  description: string;
  /** Additive style guidance for generation prompt */
  promptModifier: string;
}
