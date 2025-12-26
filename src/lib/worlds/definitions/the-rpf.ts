import type { WorldDefinition } from "../types";

/**
 * The RPF (World 2-1)
 * Phase 11: World-based randomization pools for card and landscape generation
 */
export const theRpf: WorldDefinition = {
  id: "the-rpf",
  worldLabel: "WORLD 2-1",
  displayName: "THE RPF",
  icon: "⚙",
  description:
    "Industrial oppression on a grim factory floor where quotas and rations grind workers down.",
  promptModifier:
    "Oppressive factory floor. Gray metal walls, steam pipes, conveyor belts carrying blocks, flickering fluorescent lights, sweat and grit. Sega Genesis era pixel art.",
  scenePromptModifier:
    "Side-scrolling factory interior with heavy gray machinery, long conveyor belt of colored pixel blocks, hissing steam pipes, and flickering yellow-white lights. Oppressive, industrial, and claustrophobic.",
  sceneCamera:
    "Side-scrolling industrial stage view. Long horizontal conveyor belt, fixed camera height, layered machinery depth.",
  framePath: "/frames/the-rpf.png",
  titles: [
    "THE RPF",
    "SHIFT CHANGE",
    "THE GRIND",
    "QUOTA",
    "ASSEMBLY LINE",
    "FACTORY FLOOR",
    "PUNCH CLOCK",
    "OVERTIME",
  ],
  classes: ["LABORER", "WORKER", "DRONE", "COG", "UNIT #7749", "GRUNT"],
  statPools: [
    { label: "ENERGY", values: ["10%", "DEPLETED", "BORROWED", "EMPTY"] },
    { label: "STR", values: ["+2", "WORN", "BUILDING", "MAXED"] },
    { label: "QUOTA", values: ["UNMET", "CLOSE", "IMPOSSIBLE", "RIGGED"] },
    { label: "MORALE", values: ["LOW", "CRUSHED", "DEFIANT", "RISING"] },
    { label: "SHIFT", values: ["3/3", "ENDLESS", "DOUBLE", "FINAL"] },
    { label: "RATIONS", values: ["EARNED", "DENIED", "HALVED"] },
  ],
  uiExtras: [
    { label: "QUOTA", values: ["12%", "50%", "89%", "100%"] },
    { label: "SHIFT", values: ["1/3", "2/3", "3/3", "OT"] },
    { label: "POWER", values: ["⚡ LOW", "⚡ MED", "⚡ FULL", "⚡ OUT"] },
  ],
};
