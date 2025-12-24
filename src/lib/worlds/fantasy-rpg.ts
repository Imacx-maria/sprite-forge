import type { WorldDefinition } from "./types";

export const fantasyRpg: WorldDefinition = {
  id: "fantasy-rpg",
  displayName: "Fantasy RPG",
  description: "Medieval fantasy with magic and dragons",
  icon: "⚔️",
  promptModifier:
    "Medieval fantasy aesthetic. Warm earth tones, golden highlights, mystical glow effects. Heroic and adventurous mood.",
  scenePromptModifier:
    "Medieval fantasy village. Cobblestone paths and small buildings. Greenery and open sky. Peaceful, inviting atmosphere.",
  sceneCamera: "Top-down or isometric view. Fixed angle.",
  cardType: "HERO CARD",
  classLabel: "Fantasy Hero",
  framePath: "/frames/fantasy-rpg.png",
};
