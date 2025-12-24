import type { WorldDefinition } from "./types";

export const candyLand: WorldDefinition = {
  id: "candy-land",
  displayName: "Candy Land",
  description: "Sweet and colorful sugary world",
  icon: "🍭",
  promptModifier:
    "Whimsical candy aesthetic. Bright pastels, pinks, candy colors, sparkles and shine. Cheerful and playful mood.",
  scenePromptModifier:
    "Magical candy kingdom. Lollipop trees, gumdrop hills, chocolate rivers. Bright sunny sky with cotton candy clouds.",
  sceneCamera: "Top-down or isometric view. Whimsical angle.",
  cardType: "CANDY CARD",
  classLabel: "Candy Hero",
  framePath: "/frames/candyland.png",
};
