import type { WorldDefinition } from "../types";

/**
 * Prison Planet (World 1-3)
 * Phase 11: World-based randomization pools for card and landscape generation
 */
export const prisonPlanet: WorldDefinition = {
  id: "prison-planet",
  worldLabel: "WORLD 1-3",
  displayName: "PRISON PLANET",
  icon: "🧬",
  description:
    "A false paradise simulation with looping paths, too-perfect colors, and a glowing cyan grid sky that betrays the cage.",
  promptModifier:
    "False paradise simulation. Overly bright green grass, repeating flower patterns, and a cyan hexagonal grid sky. Uncanny, too-perfect environment with a looping path. SNES pixel art.",
  scenePromptModifier:
    "Isometric/top-down overworld with a winding green path that loops illogically. Oversaturated grass, repeated oversized pixel flowers, and a glowing cyan geometric grid sky instead of clouds. Uncanny valley calm masking a digital cage.",
  sceneCamera:
    "Isometric or top-down RPG overworld view. Grid-aligned terrain, subtle perspective tilt, looping paths visible.",
  framePath: "/frames/prison-planet.png",
  titles: [
    "PRISON PLANET",
    "THE SIMULATION",
    "FALSE PARADISE",
    "GILDED CAGE",
    "THE LOOP",
    "UNCANNY VALLEY",
    "THE CONSTRUCT",
    "DÉJÀ VU",
  ],
  classes: ["AWAKENED", "GLITCH", "SEER", "UNPLUGGED", "LUCID", "ANOMALY"],
  statPools: [
    { label: "SANITY", values: ["LOW", "STABLE", "CRACKING", "CLEAR"] },
    { label: "PERCEPTION", values: ["HIGH", "MAXED", "OVERWHELMING"] },
    { label: "REALITY", values: ["QUESTIONED", "BROKEN", "SEEN"] },
    { label: "LOOPS", values: ["999", "ESCAPED", "COUNTING"] },
    { label: "DOUBT", values: ["NONE", "GROWING", "RESOLVED"] },
    { label: "STATUS", values: ["TRAPPED", "AWARE", "BREAKING FREE"] },
  ],
  uiExtras: [
    { label: "LOOP", values: ["147", "256", "001", "999"] },
    { label: "GLITCH", values: ["▓▓", "▓▓▓", "░░░", "ERROR"] },
    { label: "REAL", values: ["??%", "12%", "87%", "???"] },
  ],
};
