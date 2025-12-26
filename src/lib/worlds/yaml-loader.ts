/**
 * YAML World Loader — Server-side world spec loading and validation
 * V2: Loads world definitions from config/worlds/*.yaml
 *
 * IMPORTANT: This module uses Node.js fs and should only be imported server-side
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { WorldSpec, WorldSpecValidation } from "./world-spec";

/**
 * Path to world YAML files relative to project root
 */
const WORLDS_CONFIG_DIR = path.join(process.cwd(), "config", "worlds");

/**
 * Snake case regex pattern for id validation
 */
const SNAKE_CASE_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;

/**
 * Validate a WorldSpec object
 * Checks all required fields and their types
 */
export function validateWorldSpec(spec: unknown): WorldSpecValidation {
  const issues: string[] = [];

  // Type guard
  if (!spec || typeof spec !== "object") {
    return { ok: false, issues: ["Spec is not an object"] };
  }

  const s = spec as Record<string, unknown>;

  // Required string fields
  const requiredStrings = [
    "id",
    "displayName",
    "description",
    "icon",
    "promptModifier",
    "scenePromptModifier",
    "sceneCamera",
    "classLabel",
    "framePath",
  ] as const;

  for (const field of requiredStrings) {
    if (typeof s[field] !== "string") {
      issues.push(`${field}: must be a string`);
    } else if ((s[field] as string).trim() === "") {
      issues.push(`${field}: cannot be empty`);
    }
  }

  // id must be snake_case
  if (typeof s.id === "string" && !SNAKE_CASE_PATTERN.test(s.id)) {
    issues.push(`id: must be snake_case (got "${s.id}")`);
  }

  // cardTitles must be non-empty string array
  if (!Array.isArray(s.cardTitles)) {
    issues.push("cardTitles: must be an array");
  } else if (s.cardTitles.length === 0) {
    issues.push("cardTitles: cannot be empty");
  } else {
    for (let i = 0; i < s.cardTitles.length; i++) {
      if (typeof s.cardTitles[i] !== "string") {
        issues.push(`cardTitles[${i}]: must be a string`);
      }
    }
  }

  // Optional dimension fields
  if (s.cardDimensions !== undefined) {
    if (typeof s.cardDimensions !== "object" || s.cardDimensions === null) {
      issues.push("cardDimensions: must be an object");
    } else {
      const dims = s.cardDimensions as Record<string, unknown>;
      if (typeof dims.width !== "number" || dims.width <= 0) {
        issues.push("cardDimensions.width: must be a positive number");
      }
      if (typeof dims.height !== "number" || dims.height <= 0) {
        issues.push("cardDimensions.height: must be a positive number");
      }
    }
  }

  if (s.sceneDimensions !== undefined) {
    if (typeof s.sceneDimensions !== "object" || s.sceneDimensions === null) {
      issues.push("sceneDimensions: must be an object");
    } else {
      const dims = s.sceneDimensions as Record<string, unknown>;
      if (typeof dims.width !== "number" || dims.width <= 0) {
        issues.push("sceneDimensions.width: must be a positive number");
      }
      if (typeof dims.height !== "number" || dims.height <= 0) {
        issues.push("sceneDimensions.height: must be a positive number");
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

/**
 * Load and parse a single YAML world spec file
 */
function loadYamlFile(filePath: string): WorldSpec | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = yaml.load(content);

    // Trim multiline strings (YAML block scalars may have trailing newlines)
    if (parsed && typeof parsed === "object") {
      const spec = parsed as Record<string, unknown>;
      for (const key of ["promptModifier", "scenePromptModifier"]) {
        if (typeof spec[key] === "string") {
          spec[key] = (spec[key] as string).trim();
        }
      }
    }

    const validation = validateWorldSpec(parsed);
    if (!validation.ok) {
      console.error(
        `[yaml-loader] Invalid world spec in ${filePath}:`,
        validation.issues
      );
      return null;
    }

    return parsed as WorldSpec;
  } catch (error) {
    console.error(`[yaml-loader] Error loading ${filePath}:`, error);
    return null;
  }
}

/**
 * Load all world specs from config/worlds/
 * Returns specs sorted by displayName for stable ordering
 */
export function loadAllWorldSpecs(): WorldSpec[] {
  // Check if directory exists
  if (!fs.existsSync(WORLDS_CONFIG_DIR)) {
    console.error(
      `[yaml-loader] Worlds config directory not found: ${WORLDS_CONFIG_DIR}`
    );
    return [];
  }

  // Get all YAML files
  const files = fs.readdirSync(WORLDS_CONFIG_DIR).filter((f) => {
    return f.endsWith(".yaml") || f.endsWith(".yml");
  });

  if (files.length === 0) {
    console.warn(`[yaml-loader] No YAML files found in ${WORLDS_CONFIG_DIR}`);
    return [];
  }

  // Load and validate each file
  const specs: WorldSpec[] = [];

  for (const file of files) {
    const filePath = path.join(WORLDS_CONFIG_DIR, file);
    const spec = loadYamlFile(filePath);
    if (spec) {
      specs.push(spec);
    }
  }

  // Sort by displayName for stable ordering
  specs.sort((a, b) => a.displayName.localeCompare(b.displayName));

  console.log(`[yaml-loader] Loaded ${specs.length} world specs`);
  return specs;
}

/**
 * Load a single world spec by ID
 * Returns null if not found or invalid
 */
export function loadWorldSpecById(id: string): WorldSpec | null {
  // Normalize id to filename (snake_case.yaml)
  const possibleFilenames = [`${id}.yaml`, `${id}.yml`];

  for (const filename of possibleFilenames) {
    const filePath = path.join(WORLDS_CONFIG_DIR, filename);
    if (fs.existsSync(filePath)) {
      const spec = loadYamlFile(filePath);
      if (spec && spec.id === id) {
        return spec;
      }
    }
  }

  // Fallback: scan all files for matching ID
  const allSpecs = loadAllWorldSpecs();
  return allSpecs.find((s) => s.id === id) || null;
}

/**
 * Get all world IDs (for type safety and validation)
 */
export function getAllWorldIds(): string[] {
  return loadAllWorldSpecs().map((s) => s.id);
}

/**
 * Default world ID for initial state
 */
export const DEFAULT_WORLD_ID = "fantasy_rpg";
