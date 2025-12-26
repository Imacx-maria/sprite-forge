"use client";

/**
 * WizardNavigation — Back button and step label
 * Phase 9: Wizard flow refactor
 */

interface WizardNavigationProps {
  onBack: () => void;
  stepLabel?: string;
}

export function WizardNavigation({ onBack, stepLabel }: WizardNavigationProps) {
  return (
    <div className="flex w-full items-center justify-between px-4 py-4">
      <button
        onClick={onBack}
        className="min-h-[44px] px-4 text-lg tracking-wide text-[#888888] transition-colors hover:text-white"
      >
        ← BACK
      </button>
      {stepLabel && (
        <span className="text-sm tracking-wider text-[#666666]">{stepLabel}</span>
      )}
    </div>
  );
}
