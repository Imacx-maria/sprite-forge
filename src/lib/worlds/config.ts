/**
 * World Configurations
 * Each world defines a unique visual style through prompt modifiers
 */

import { World, WorldId } from './types';

export const WORLDS: Record<WorldId, World> = {
  'fantasy-rpg': {
    id: 'fantasy-rpg',
    displayName: 'FANTASY RPG',
    description: 'Medieval fantasy with magic and dragons',
    icon: '⚔️',
    promptModifier: `Setting: medieval fantasy realm with castles and enchanted forests.
Style: warm earth tones, golden highlights, mystical glow effects.
Mood: heroic, adventurous, magical.`,
  },

  'street-brawler': {
    id: 'street-brawler',
    displayName: 'STREET BRAWLER',
    description: 'Urban combat with neon-lit streets',
    icon: '👊',
    promptModifier: `Setting: gritty urban streets with graffiti and neon signs.
Style: high contrast, neon accents on dark backgrounds, urban decay.
Mood: intense, rebellious, street-tough.`,
  },

  'space-marine': {
    id: 'space-marine',
    displayName: 'SPACE MARINE',
    description: 'Futuristic soldier in cosmic warfare',
    icon: '🚀',
    promptModifier: `Setting: sci-fi military spacecraft and alien planets.
Style: metallic blues and grays, holographic highlights, armored suit details.
Mood: disciplined, powerful, tactical.`,
  },

  'gothic-hunter': {
    id: 'gothic-hunter',
    displayName: 'GOTHIC HUNTER',
    description: 'Dark Victorian monster slayer',
    icon: '🦇',
    promptModifier: `Setting: dark Victorian gothic world with fog and moonlight.
Style: deep purples, blacks, silver accents, Victorian clothing details.
Mood: mysterious, brooding, supernatural.`,
  },

  'candy-land': {
    id: 'candy-land',
    displayName: 'CANDY LAND',
    description: 'Sweet and colorful sugary world',
    icon: '🍭',
    promptModifier: `Setting: whimsical candy kingdom with sweets and pastries.
Style: bright pastels, pinks, candy colors, sparkles and shine.
Mood: cheerful, playful, sugary sweet.`,
  },

  'galactic-overlord': {
    id: 'galactic-overlord',
    displayName: 'GALACTIC OVERLORD',
    description: 'Cosmic ruler of the universe',
    icon: '👑',
    promptModifier: `Setting: cosmic throne room among stars and nebulae.
Style: deep space purples and blacks, cosmic energy, regal gold accents.
Mood: imposing, majestic, all-powerful.`,
  },
};

/** Ordered list of world IDs for consistent UI display */
export const WORLD_ORDER: WorldId[] = [
  'fantasy-rpg',
  'street-brawler',
  'space-marine',
  'gothic-hunter',
  'candy-land',
  'galactic-overlord',
];

/** Get world by ID with type safety */
export function getWorld(id: WorldId): World {
  return WORLDS[id];
}

/** Get all worlds in display order */
export function getAllWorlds(): World[] {
  return WORLD_ORDER.map((id) => WORLDS[id]);
}

/** Default world selection */
export const DEFAULT_WORLD_ID: WorldId = 'fantasy-rpg';
