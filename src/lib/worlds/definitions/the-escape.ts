import type { WorldDefinition } from "../types";

/**
 * The Escape (World 1-1)
 * Phase 11: World-based randomization pools for card and landscape generation
 */
export const theEscape: WorldDefinition = {
  id: "the-escape",
  worldLabel: "WORLD 1-1",
  displayName: "THE ESCAPE",
  icon: "🔓",
  description:
    "A desperate nighttime escape from a desert detention compound, razor wire overhead and searchlights sweeping the dust.",
  promptModifier:
    "Night desert detention compound. Chain-link fence topped with razor wire, sweeping searchlights, dusty ground, and orange sodium lights clashing with cold blue moonlight. Tense escape mood, SNES pixel art.",
  scenePromptModifier:
    "Side-scrolling desert compound at night. Tall chain-link fence with razor wire dominates the midground, guard tower with sweeping yellow searchlight, dirt path in foreground, dark blue mountains in the distance, starry sky. Orange sodium glow vs blue moonlight for high-contrast tension.",
  sceneCamera:
    "Side-scrolling view. Horizontal ground plane with parallax mountains, fixed camera height, strong left-to-right movement.",
  framePath: "/frames/the-escape.png",
  titles: [
    "THE ESCAPE",
    "BREAKOUT",
    "NIGHT RUN",
    "THE CROSSING",
    "GONE BY DAWN",
    "NO TURNING BACK",
    "THE WIRE",
    "FIRST STEP",
  ],
  classes: ["DEFECTOR", "RUNNER", "GHOST", "FUGITIVE", "SHADOW", "UNCHAINED"],
  statPools: [
    { label: "SPD", values: ["MAX", "+5", "OVERDRIVE", "FLEEING"] },
    { label: "STEALTH", values: ["ACTIVE", "CLOAKED", "BROKEN", "SILENT"] },
    { label: "FEAR", values: ["NONE", "CONQUERED", "FUEL", "GONE"] },
    { label: "PURSUIT", values: ["CLOSE", "LOSING THEM", "CLEAR"] },
    { label: "HP", values: ["8-BIT", "FULL", "LOW", "ADRENALINE"] },
    { label: "STATUS", values: ["WANTED", "MISSING", "GHOST"] },
  ],
  uiExtras: [
    { label: "KEY", values: ["🔑 x0", "🔑 x1", "🔑 x2"] },
    { label: "ALERT", values: ["!", "!!", "!!!", "CLEAR"] },
    { label: "TIME", values: ["99", "60", "30", "10"] },
  ],
};
