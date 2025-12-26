"use client";

/**
 * WizardProgress — Visual progress indicator
 * Phase 9: Wizard flow refactor
 */

interface WizardProgressProps {
  currentStep: 1 | 2 | 3;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              step === currentStep
                ? "bg-white"
                : step < currentStep
                ? "bg-[#666666]"
                : "border border-[#444444]"
            }`}
          />
          {step < 3 && <div className="h-px w-4 bg-[#333333]" />}
        </div>
      ))}
    </div>
  );
}
