import type { WorldDefinition } from "../types";

/**
 * The Aftermath (World 3-1)
 * Phase 11: World-based randomization pools for card and landscape generation
 */
export const theAftermath: WorldDefinition = {
  id: "the-aftermath",
  worldLabel: "WORLD 3-1",
  displayName: "THE AFTERMATH",
  icon: "🌅",
  description:
    "Freedom at a lonely desert bus stop as a vast sunrise paints the horizon and the road stretches into possibility.",
  promptModifier:
    "Quiet desert bus stop at sunrise. Dithered orange/yellow/pink horizon, empty gray road, vast open desert, peaceful and hopeful mood. SNES pixel art.",
  scenePromptModifier:
    "Side-scrolling desert scene with a small bus stop shelter in the foreground, empty road stretching to infinity, and a large dithered sunrise in orange, yellow, and pink. Calm, spacious, and hopeful atmosphere.",
  sceneCamera:
    "Cinematic side-scrolling view. Low horizon line, wide open sky, strong left-to-right road perspective.",
  framePath: "/frames/the-aftermath.png",
  titles: [
    "THE AFTERMATH",
    "NEW DAWN",
    "FIRST LIGHT",
    "THE ROAD AHEAD",
    "FREE AT LAST",
    "SUNRISE",
    "CHAPTER TWO",
    "HORIZON",
  ],
  classes: ["FREE ONE", "WANDERER", "PILGRIM", "SURVIVOR", "REBORN", "UNCHAINED"],
  statPools: [
    { label: "HP", values: ["RESTORED", "FULL", "HEALING", "NEW"] },
    { label: "HOPE", values: ["MAX", "RISING", "INFINITE", "FOUND"] },
    { label: "DESTINY", values: ["OPEN", "UNWRITTEN", "YOURS", "CLEAR"] },
    { label: "PEACE", values: ["EARNED", "FRAGILE", "GROWING", "REAL"] },
    { label: "MILES", values: ["∞", "AHEAD", "FIRST", "MANY"] },
    { label: "STATUS", values: ["FREE", "BREATHING", "ALIVE", "HOME"] },
  ],
  uiExtras: [
    { label: "MILES", values: ["∞", "999", "001", "???"] },
    { label: "SUN", values: ["☀ RISING", "☀ UP", "☀ HIGH", "☀ SET"] },
    { label: "FREE", values: ["YES", "TRUE", "100%", "FINALLY"] },
  ],
};
