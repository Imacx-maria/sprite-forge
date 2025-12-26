import type { WorldDefinition } from "../types";

/**
 * Surveillance State (World 2-2)
 * Phase 11: World-based randomization pools for card and landscape generation
 */
export const surveillanceState: WorldDefinition = {
  id: "surveillance-state",
  worldLabel: "WORLD 2-2",
  displayName: "SURVEILLANCE STATE",
  icon: "👁",
  description:
    "A paranoid maze of metallic corridors where cameras and spotlights track every step.",
  promptModifier:
    "Total observation. Dark metallic corridors, eye-motif propaganda posters, security cameras, red indicator lights, and harsh yellow spotlights. Oppressive surveillance mood, SNES pixel art.",
  scenePromptModifier:
    "Isometric stealth corridors in dark gray metal. Posters with stylized eyes, security cameras mounted on walls, red blinking indicators, and stark yellow spotlight cones. Paranoid, oppressive atmosphere.",
  sceneCamera:
    "Isometric stealth-game camera. Angled corridors, clear sightlines, spotlight cones visible.",
  framePath: "/frames/surveillance-state.png",
  titles: [
    "SURVEILLANCE STATE",
    "ALL EYES",
    "THE WATCHERS",
    "PANOPTICON",
    "UNDER GLASS",
    "SPOTTED",
    "NO PRIVACY",
    "BIG BROTHER",
  ],
  classes: [
    "MARKED ONE",
    "SUSPECT",
    "TARGET",
    "FLAGGED",
    "DISSIDENT",
    "PERSON OF INTEREST",
  ],
  statPools: [
    { label: "STEALTH", values: ["BROKEN", "COMPROMISED", "GHOST", "NULL"] },
    { label: "ANXIETY", values: ["MAX", "RISING", "MANAGED", "NUMB"] },
    { label: "CAMS", values: ["12", "EVERYWHERE", "BLIND SPOT"] },
    { label: "TRUST", values: ["-99", "REVOKED", "ZERO", "EARNED"] },
    { label: "HEAT", values: ["HIGH", "CRITICAL", "COOLING", "RED"] },
    { label: "STATUS", values: ["WATCHED", "TRACKED", "HUNTED", "ERASED"] },
  ],
  uiExtras: [
    { label: "EYES", values: ["👁 x12", "👁 x8", "👁 x4", "👁 x0"] },
    { label: "THREAT", values: ["██", "███", "████", "NONE"] },
    { label: "CAMS", values: ["ON", "OFF", "LOOP", "DEAD"] },
  ],
};
