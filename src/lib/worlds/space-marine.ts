import type { WorldDefinition } from "./types";

export const spaceMarine: WorldDefinition = {
  id: "space-marine",
  displayName: "Space Marine",
  description: "Futuristic soldier in cosmic warfare",
  icon: "🚀",
  promptModifier:
    "Sci-fi military aesthetic. Metallic blues and grays, holographic highlights, armored suit details. Disciplined and tactical mood.",
  scenePromptModifier:
    "Futuristic military base. Metallic corridors, holographic displays, spacecraft visible through windows. Cold industrial lighting.",
  sceneCamera: "Side-scrolling view. Corridor perspective.",
  cardType: "SOLDIER CARD",
  classLabel: "Space Marine",
  framePath: "/frames/space-marine.png",
};
