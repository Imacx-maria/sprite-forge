import type { WorldDefinition } from "./types";

export const gothicHunter: WorldDefinition = {
  id: "gothic-hunter",
  displayName: "Gothic Hunter",
  description: "Dark Victorian monster slayer",
  icon: "🦇",
  promptModifier:
    "Dark Victorian gothic aesthetic. Deep purples, blacks, silver accents, period clothing details. Mysterious and brooding mood.",
  scenePromptModifier:
    "Victorian gothic cityscape. Foggy cobblestone streets, gas lamps, dark architecture. Moonlit night with ominous atmosphere.",
  sceneCamera: "Side-scrolling view. Street-level perspective.",
  cardType: "HUNTER CARD",
  classLabel: "Gothic Hunter",
  framePath: "/frames/gothic-hunter.png",
};
