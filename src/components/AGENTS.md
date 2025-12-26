# src/components/ — React Components

All React UI components. Client-side only (`"use client"`).

---

## Structure

```
components/
├── index.ts              # Barrel exports
├── Panel01PhotoInput.tsx # Main flow: upload → world select → generate → results
├── PlayerCard.tsx        # Renders composed player card with download
├── WorldScene.tsx        # Renders world scene with download
├── WorldSelector.tsx     # World theme picker
├── PhotoUpload.tsx       # Drag-drop + file picker
├── PhotoPreview.tsx      # Shows selected photo
├── WebcamCapture.tsx     # Webcam photo capture
├── NameInput.tsx         # Player name + stats input
└── AccessGate.tsx        # Phase 0 access code gate
```

---

## Patterns

### Component Structure
```typescript
"use client";

/**
 * ComponentName — Brief description
 *
 * Phase X: What this component does
 */

interface ComponentNameProps {
  prop1: string;
  onAction?: () => void;
}

export function ComponentName({ prop1, onAction }: ComponentNameProps) {
  // hooks
  // handlers
  // render
}
```

### Exports
All components exported via `index.ts`:
```typescript
export { ComponentName } from "./ComponentName";
```

### State Management
- Local state via `useState`
- Shared state via `usePhoto()` from `@/context`
- No Redux/Zustand — keep it simple

---

## Key Components

| Component | Purpose | Example Usage |
|-----------|---------|---------------|
| `Panel01PhotoInput` | Main flow orchestrator | `<Panel01PhotoInput onBack={...} />` |
| `PlayerCard` | Canvas-composed card | `<PlayerCard characterImage={...} character={...} framePath={...} />` |
| `WorldSelector` | Theme picker grid | `<WorldSelector selectedWorldId={...} onWorldChange={...} />` |
| `PhotoUpload` | File input + drag-drop | `<PhotoUpload />` (uses PhotoContext) |

---

## Commands

```bash
# Find all components
rg -n "export function [A-Z]" src/components/

# Find component props interfaces
rg -n "interface.*Props" src/components/

# Find hooks usage
rg -n "use[A-Z]\w+\(" src/components/
```

---

## Styling

- Tailwind CSS classes only
- Dark theme: `bg-[#0a0a0a]` background
- Text colors: `text-white`, `text-[#888888]`, `text-[#666666]`
- Font: VT323 (pixel font) for card overlays
- No CSS modules, no styled-components

---

## Gotchas

- **Canvas rendering**: `PlayerCard` uses canvas for composition; requires `"use client"`
- **Photo context**: Use `usePhoto()` hook, not prop drilling
- **Webcam**: Requires HTTPS in production (or localhost)
- **Download**: Uses programmatic `<a>` click with `download` attribute
