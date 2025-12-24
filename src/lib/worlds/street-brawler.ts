import type { WorldDefinition } from "./types";

export const streetBrawler: WorldDefinition = {
  id: "street-brawler",
  displayName: "Street Brawler",
  description: "Urban combat with neon-lit streets",
  icon: "👊",
  promptModifier:
    "Gritty urban aesthetic. High contrast, neon accents on dark backgrounds, urban decay textures. Intense and rebellious mood.",
  scenePromptModifier:
    "Gritty urban alleyway. Neon signs, graffiti walls, wet pavement reflections. Night scene with dramatic lighting.",
  sceneCamera: "Side-scrolling view. Street-level perspective.",
  cardType: "FIGHTER CARD",
  classLabel: "Street Brawler",
  framePath: "/frames/street-brawler.png",
};
