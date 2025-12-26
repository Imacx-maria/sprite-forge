/**
 * useWorlds Hook — Client-side world fetching
 * V2: Fetches world list from API instead of hardcoded values
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { WorldSummary } from "./types";
import { DEFAULT_WORLD_ID } from "./constants";

interface UseWorldsResult {
  worlds: WorldSummary[];
  worldsMap: Map<string, WorldSummary>;
  loading: boolean;
  error: string | null;
  defaultWorldId: string;
  getWorldById: (id: string) => WorldSummary | undefined;
}

/**
 * API response shape
 */
interface WorldsApiResponse {
  success: boolean;
  worlds: WorldSummary[];
  count: number;
  error?: string;
}

/**
 * Fallback default world ID
 */
const FALLBACK_DEFAULT_ID = DEFAULT_WORLD_ID;

/**
 * Hook to fetch available worlds from the API
 */
export function useWorlds(): UseWorldsResult {
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWorlds() {
      try {
        const response = await fetch("/api/worlds");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: WorldsApiResponse = await response.json();

        if (!cancelled) {
          if (data.success && Array.isArray(data.worlds)) {
            setWorlds(data.worlds);
            setError(null);
          } else {
            setError(data.error || "Invalid API response");
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load worlds";
          setError(message);
          console.error("[useWorlds] Error fetching worlds:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWorlds();

    return () => {
      cancelled = true;
    };
  }, []);

  // Create a map for efficient lookup by ID
  const worldsMap = useMemo(() => {
    const map = new Map<string, WorldSummary>();
    for (const world of worlds) {
      map.set(world.id, world);
    }
    return map;
  }, [worlds]);

  // Get world by ID helper
  const getWorldById = useCallback(
    (id: string) => worldsMap.get(id),
    [worldsMap]
  );

  // Default world is first in the sorted list, or fallback
  const defaultWorldId =
    worlds.length > 0 ? worlds[0].id : FALLBACK_DEFAULT_ID;

  return { worlds, worldsMap, loading, error, defaultWorldId, getWorldById };
}
