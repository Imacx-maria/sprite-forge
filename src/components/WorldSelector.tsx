"use client";

/**
 * WorldSelector — World selection component
 *
 * Phase 6: World Selection
 * V2: Fetches worlds from API instead of hardcoded list
 *
 * - Displays available worlds in a grid
 * - Single selection at a time
 * - Desktop-first layout
 * - Retro gaming aesthetic
 */

import { useCallback, useEffect } from "react";
import { useWorlds } from "@/lib/worlds/use-worlds";
import type { WorldSummary } from "@/lib/worlds/types";

interface WorldSelectorProps {
  /** Currently selected world ID */
  selectedWorldId: string;
  /** Callback when world selection changes */
  onWorldChange: (worldId: string) => void;
  /** Whether selection is disabled (e.g., during generation) */
  disabled?: boolean;
}

export function WorldSelector({
  selectedWorldId,
  onWorldChange,
  disabled = false,
}: WorldSelectorProps) {
  const { worlds, loading, error, defaultWorldId } = useWorlds();

  // Auto-select default world when worlds load
  useEffect(() => {
    if (worlds.length > 0 && !selectedWorldId) {
      onWorldChange(defaultWorldId);
    }
  }, [worlds, selectedWorldId, defaultWorldId, onWorldChange]);

  const handleSelect = useCallback(
    (world: WorldSummary) => {
      if (!disabled) {
        onWorldChange(world.id);
      }
    },
    [disabled, onWorldChange]
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl tracking-widest text-white">SELECT WORLD</h2>
          <p className="text-lg tracking-wide text-[#666666]">LOADING...</p>
        </div>
        <div className="grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex h-24 flex-col items-center justify-center gap-2 border-4 border-[#333333] bg-[#111111] p-4"
            >
              <span className="h-8 w-8 animate-pulse rounded bg-[#333333]" />
              <span className="h-3 w-16 animate-pulse rounded bg-[#333333]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl tracking-widest text-white">SELECT WORLD</h2>
          <p className="text-lg tracking-wide text-red-500">
            ERROR: {error}
          </p>
        </div>
      </div>
    );
  }

  // Get currently selected world for description
  const selectedWorld = worlds.find((w) => w.id === selectedWorldId);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Section header */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl tracking-widest text-white">SELECT WORLD</h2>
        <p className="text-lg tracking-wide text-[#666666]">
          CHOOSE YOUR BATTLE REALM
        </p>
      </div>

      {/* World grid - 3 columns on desktop, 2 on mobile */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-3">
        {worlds.map((world) => {
          const isSelected = world.id === selectedWorldId;

          return (
            <button
              key={world.id}
              type="button"
              onClick={() => handleSelect(world)}
              disabled={disabled}
              className={`
                flex flex-col items-center gap-2 p-4
                border-4 transition-all
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                ${
                  isSelected
                    ? "border-white bg-white/10"
                    : "border-[#333333] bg-[#111111] hover:border-[#555555] hover:bg-[#1a1a1a]"
                }
              `}
              aria-pressed={isSelected}
              aria-label={`Select ${world.displayName} world`}
            >
              {/* World icon */}
              <span className="text-3xl" role="img" aria-hidden="true">
                {world.icon}
              </span>

              {/* World name */}
              <span
                className={`
                  text-sm tracking-wider
                  ${isSelected ? "text-white" : "text-[#888888]"}
                `}
              >
                {world.displayName}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <span className="text-xs tracking-wide text-[#666666]">
                  [ SELECTED ]
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected world description */}
      {selectedWorld && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-lg tracking-wide text-[#888888]">
            {selectedWorld.description}
          </p>
        </div>
      )}
    </div>
  );
}
