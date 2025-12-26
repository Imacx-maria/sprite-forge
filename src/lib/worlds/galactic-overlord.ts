import type { WorldDefinition } from "./types";

/**
 * Galactic Overlord World
 *
 * Feel: "Lost space-opera lore from an old cartridge"
 * Reference: Retro sci-fi mythology, cosmic rulers
 * Character: Beyond mortal, may float or loom, mythic transformation
 */
export const galacticOverlord: WorldDefinition = {
  id: "galactic-overlord",
  displayName: "Galactic Overlord",
  description: "Cosmic ruler of the universe",
  icon: "👑",
  promptModifier:
    "Cosmic royalty aesthetic. Deep space purples, blacks, cosmic energy, regal gold accents. Mythic transformation allowed, glowing eyes permitted. Imposing and eternal mood.",
  scenePromptModifier:
    "RETRO SPACE-OPERA COSMIC THRONE SCENE. Vast deep space backdrop with planets, stars, nebulae. Character small relative to universe but presented as COSMIC ENTITY, may float or loom. Scale conveys power, not size. Mythic sci-fi color palette (purples, blues, cyan). Feels like lost lore from an old cartridge. VAST AND ETERNAL atmosphere. Character BEYOND MORTAL.",
  sceneCamera: "Wide cosmic view. Fixed perspective. No close-ups. Mythic scale with planets and stars visible.",
  cardTitles: [
    "OVERLORD CARD",
    "COSMIC RULER",
    "VOID EMPEROR",
    "STAR KING",
    "ETERNAL ONE",
  ],
  classLabel: "Galactic Overlord",
  framePath: "/frames/galactic-overlord.png",
};
