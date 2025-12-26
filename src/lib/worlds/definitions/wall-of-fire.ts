import type { WorldDefinition } from "../types";

/**
 * Wall of Fire (World 1-2)
 * Phase 11: World-based randomization pools for card and landscape generation
 */
export const wallOfFire: WorldDefinition = {
  id: "wall-of-fire",
  worldLabel: "WORLD 1-2",
  displayName: "WALL OF FIRE",
  icon: "🔥",
  description:
    "A cosmic survival platformer on a tiny floating rock above an endless sea of molten lava.",
  promptModifier:
    "Cosmic survival platformer. Floating rock platform above a bubbling lava sea, faint blue energy shield, deep space with nebulae and distant planets. Heat shimmer in the air, SNES pixel art.",
  scenePromptModifier:
    "Single floating rock platform suspended over endless bubbling lava. Orange-red molten sea below, heat distortion rising. Dark space sky with colorful nebulae, stars, and distant planets. Faint blue energy shield around the platform.",
  sceneCamera:
    "Side-scrolling platformer view. Clear platform edges, strong vertical danger drop, fixed camera height.",
  framePath: "/frames/wall-of-fire.png",
  titles: [
    "WALL OF FIRE",
    "FLOOR IS LAVA",
    "THE CRUCIBLE",
    "HEAT DEATH",
    "TRIAL BY FIRE",
    "MOLTEN REALM",
    "BURN ZONE",
    "LAST PLATFORM",
  ],
  classes: [
    "SURVIVOR",
    "ENDURER",
    "FLAME-TOUCHED",
    "HEAT-WALKER",
    "SCORCHED",
    "ASHEN ONE",
  ],
  statPools: [
    { label: "HP", values: ["CRITICAL", "HOLDING", "1-UP", "BURNING"] },
    { label: "DEF", values: ["MAX", "SHIELDED", "CRACKED", "IRON"] },
    { label: "HEAT RES", values: ["100%", "IMMUNE", "ADAPTED", "MELTING"] },
    { label: "BALANCE", values: ["STEADY", "WOBBLING", "LOCKED"] },
    { label: "END", values: ["INFINITE", "FADING", "TESTED"] },
    { label: "STATUS", values: ["STANDING", "SINGED", "UNTOUCHABLE"] },
  ],
  uiExtras: [
    { label: "SHIELD", values: ["🛡 ON", "🛡 OFF", "🛡 LOW"] },
    { label: "HEAT", values: ["99%", "75%", "50%", "25%"] },
    { label: "COMBO", values: ["x1", "x2", "x3", "x5"] },
  ],
};
