"use client";

/**
 * NameInput — Player name input with stats display
 *
 * Phase 0 Final: Name (max 13 chars) and stats (POWER/SPEED) for Player Card
 *
 * - Name input (max 13 characters, auto-generated if empty)
 * - Stats display (POWER/SPEED, 60-99)
 * - Randomize button fills name and re-rolls stats
 * - Does NOT trigger image regeneration
 */

import type { PlayerStats } from "@/lib/card";

interface NameInputProps {
  /** Current player name (max 13 chars) */
  name: string;
  /** Current player stats */
  stats: PlayerStats;
  /** Callback when name changes */
  onNameChange: (name: string) => void;
  /** Callback to randomize name and stats */
  onRandomize: () => void;
  /** Whether inputs are disabled */
  disabled?: boolean;
}

export function NameInput({
  name,
  stats,
  onNameChange,
  onRandomize,
  disabled = false,
}: NameInputProps) {
  const handleClear = () => {
    onNameChange("");
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      {/* Section label */}
      <p className="text-sm tracking-wider text-[#666666]">
        PLAYER IDENTITY
      </p>

      {/* Name input */}
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="ENTER NAME (AUTO-GENERATED IF EMPTY)"
        maxLength={13}
        disabled={disabled}
        className="w-full border-b-2 border-[#444444] bg-transparent py-2 text-center text-xl tracking-widest text-white placeholder-[#444444] outline-none transition-colors focus:border-white disabled:opacity-50"
      />

      {/* Stats display */}
      <div className="flex items-center gap-8 text-base tracking-wide text-[#888888]">
        <span>POWER: {stats.POWER}</span>
        <span>SPEED: {stats.SPEED}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onRandomize}
          disabled={disabled}
          className="text-base tracking-wide text-[#888888] transition-colors hover:text-white disabled:opacity-50"
        >
          [ RANDOMIZE ]
        </button>

        {name && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-base tracking-wide text-[#666666] transition-colors hover:text-[#888888] disabled:opacity-50"
          >
            [ CLEAR ]
          </button>
        )}
      </div>
    </div>
  );
}
