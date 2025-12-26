/**
 * Phase 11: World-based randomization pools for card and landscape generation
 */

export interface StatPool {
  label: string;
  values: string[];
}

export interface UIElementPool {
  label: string;
  values: string[];
}

export interface WorldDefinition {
  id: string;
  displayName: string;
  description: string;
  icon: string;
  worldLabel: string;

  titles: string[];
  classes: string[];
  statPools: StatPool[];      // at least 4 pools per world
  uiExtras: UIElementPool[];

  // Image-generation modifiers (art only)
  promptModifier: string;
  scenePromptModifier: string;
  sceneCamera: string;
  framePath: string;

  // Optional dimension overrides (for prompt-compiler compatibility)
  cardAspectRatio?: string;
  sceneAspectRatio?: string;
  cardDimensions?: { width: number; height: number };
  sceneDimensions?: { width: number; height: number };
}

export interface GeneratedCardContent {
  title: string;
  classLabel: string;
  stats: Array<{ label: string; value: string }>;
}

export interface GeneratedLandscapeUI {
  hearts: string;
  score: string;
  lives: string;
  extra: { label: string; value: string };
}

/**
 * Lightweight world summary for UI selection
 */
export interface WorldSummary {
  id: string;
  worldLabel: string;
  displayName: string;
  description: string;
  icon: string;
  titles: string[];
}
