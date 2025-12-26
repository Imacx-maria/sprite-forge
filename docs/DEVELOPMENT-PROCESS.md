# SPRITE FORGE — Development Process & Work Ethic

> Documentation for onboarding developers and maintaining consistency across versions.

---

## Overview

This document captures the development methodology used to build SPRITE FORGE V1. Follow this process for V2 and beyond to maintain quality and consistency.

---

## Documentation Locations

### Design Specifications (Read-Only Reference)

All product design, prompts, and visual specs live in a separate docs repository:

```
../spritify/spritify-docs/
├── product/               # Product definition
│   ├── overview.md        # One-page product explanation
│   ├── core-principles.md # Non-negotiable rules
│   └── user-flow.md       # Step-by-step experience
├── worlds/                # One file per game world
├── visuals/               # Visual systems
│   ├── player-card.md     # Collectible card design
│   ├── world-scene.md     # Game screenshot logic
│   └── system-messages.md # In-universe copy & tone
├── prompts/               # Prompt system architecture
│   └── prompt-architecture.md
├── api/                   # Backend specifications
│   ├── payload-spec.md    # Input/output schemas
│   └── error-handling.md  # Error behavior
├── decisions/             # Locked decisions
│   └── locked-decisions.md
└── identity.md            # Brand identity
```

**Rule:** These docs are canonical. If it's not documented there, it's not locked.

### Implementation Documentation (In Codebase)

```
sprite-forge/
├── CLAUDE.md              # AI assistant rules (root)
├── AGENTS.md              # Project overview, conventions
├── docs/
│   ├── README.md          # Doc index
│   └── DEVELOPMENT-PROCESS.md  # This file
└── src/
    ├── app/AGENTS.md      # App Router patterns
    ├── components/AGENTS.md  # Component patterns
    └── lib/AGENTS.md      # Business logic patterns
```

---

## 1. Phased Development Model

We build in **numbered phases**, each delivering a shippable increment.

### V1 Phases

```
Phase 2: UI skeleton with Panel 00 title screen
Phase 3: Client-side photo input
Phase 4: AI image generation via OpenRouter
Phase 5: Player Card generation with download
Phase 6: World selection for themed generation
Phase 8: Dual-output generation (Player Card + World Scene)
```

### Phase Rules

| Principle | Practice |
|-----------|----------|
| **Atomic commits** | One phase = one commit (or small cluster) |
| **Working at all times** | Each phase must pass build/lint before merge |
| **Phase annotations** | Every file/function notes which phase it came from |
| **Vertical slices** | Each phase delivers end-to-end functionality |

### Phase Annotations in Code

Every function/component carries its origin:

```typescript
/**
 * PhotoContext — Client-side Photo & Generation State Management
 *
 * Phase 4: Manages photo data and generation in memory only.
 * Phase 6: World selection for prompt variation
 * Phase 8: Dual-output generation (Player Card + World Scene)
 */
```

This tells future devs: "Phase 4 created this, Phase 6 extended it, Phase 8 added dual output."

---

## 2. Documentation-First Development

### The Process

```
1. DESIGN DOCS FIRST
   └── Write specs in spritify-docs/ before any code

2. REVIEW & APPROVE
   └── Specs reviewed before implementation begins

3. CODE IMPLEMENTS SPEC
   └── Deviation requires doc update first

4. PROMPTS DERIVED FROM SPECS
   └── Never invent prompts during coding
```

### AGENTS.md Files

Each folder has an AGENTS.md containing:

1. **Structure** — Folder layout with descriptions
2. **Patterns** — Code templates with examples
3. **Key Files** — What each file does
4. **Commands** — `rg`/`grep` recipes to find things
5. **Gotchas** — Known traps and how to avoid them

**Why AGENTS.md?**
- AI-friendly: Claude Code can parse these instantly
- Human-friendly: Developers get quick orientation
- Living docs: Updated alongside code changes

---

## 3. Type-First Design

Every data structure is defined before implementation.

### The Process

1. **Define types FIRST** in `types.ts`
2. **Implement functions** that consume/produce those types
3. **Export via barrel** (`index.ts`) with types re-exported
4. **Extend types** in later phases (don't delete, add properties)

### Example

```typescript
// src/lib/worlds/types.ts — Phase 6, extended Phase 8
export interface WorldDefinition {
  id: string;
  displayName: string;
  description: string;
  icon: string;
  promptModifier: string;        // Phase 6
  scenePromptModifier: string;   // Phase 8
  sceneCamera: string;           // Phase 8
  cardTitles: string[];
  classLabel: string;
  framePath: string;
}
```

---

## 4. Abstraction Layers

### Pattern

```
App Code → Public API (index.ts) → Implementation → External Service
```

**Rule:** App code NEVER imports directly from implementation files.

### Example: AI Provider

```typescript
// ✅ Correct
import { generateDualOutput } from "@/lib/ai";

// ❌ Wrong
import { createOpenRouterProvider } from "@/lib/ai/openrouter";
```

### Why?

- Swap providers without touching components
- Centralized error handling
- Single place for logging/diagnostics

---

## 5. Prompt Engineering Process

### Structure

Each prompt has three parts:

```
1. BASE TEMPLATE     → Core transformation rules (lives in prompts.ts)
2. WORLD MODIFIER    → Theme-specific additions (lives in world definition)
3. OUTPUT RULES      → Format/constraints (appended at end)
```

### Iteration Loop

```
Write prompt → Test with real photos → Analyze failures → Refine prompt → Repeat
```

**Key:** Prompts are treated as code — version controlled, reviewed, tested.

---

## 6. Canvas Composition Pattern

For the Player Card, we separate AI output from final composition:

```
AI generates: Character artwork only (no frame, no text)
              ↓
Canvas composes: Frame PNG + Artwork + Name + Stats
              ↓
Output: Complete card as data URL
```

### Why?

- AI models can't render pixel fonts consistently
- Stats/names can change without regenerating image
- Frames are static assets — predictable, fast

---

## 7. State Management Philosophy

### Client-Only, In-Memory

```typescript
// No persistence — data lost on refresh (intentional for V1)
const [photo, setPhoto] = useState<PhotoData | null>(null);
const [generatedCardImage, setGeneratedCardImage] = useState<string | null>(null);
```

### Context, Not Prop Drilling

```typescript
// Any component can access shared state:
const { photo, generatePixelArt, selectedWorld } = usePhoto();
```

---

## 8. Definition of Done (Per Phase)

Before marking a phase complete:

| Check | Command |
|-------|---------|
| TypeScript compiles | `npm run build` |
| Linting passes | `npm run lint` |
| No runtime errors | Manual browser test |
| No hardcoded secrets | `rg "sk-" src/` returns empty |
| Phase annotations updated | Check file headers |

---

## 9. Commit Message Format

### Phase Commits

```
Phase N: Brief description of what was added

Examples:
Phase 4: AI image generation via OpenRouter
Phase 6: World selection for themed generation
Phase 8: Dual-output generation (Player Card + World Scene)
```

### Non-Phase Commits

```
Fix: await setPhotoFromFile in PhotoUpload
Refactor: Extract prompt builders to separate file
Docs: Update AGENTS.md with new patterns
```

---

## 10. V2 Onboarding Checklist

For new developers:

### Step 1: Read Documentation (In Order)

1. `CLAUDE.md` (root rules)
2. `AGENTS.md` (project overview)
3. `src/lib/AGENTS.md` (business logic)
4. `src/components/AGENTS.md` (UI patterns)
5. `../spritify/spritify-docs/README.md` (design specs)

### Step 2: Run Locally

```bash
npm install
cp .env.example .env.local  # Add your API key
npm run dev
```

### Step 3: Trace the Flow

- Upload a photo → Watch `PhotoContext` state change
- Click FORGE IT → Follow to `/api/generate` → `generateDualOutput`
- See results → Trace canvas composition in `PlayerCard`

### Step 4: Before Writing Code

- Check if types exist in `types.ts`
- Check AGENTS.md for patterns
- Determine which phase this belongs to
- Update phase annotations in file headers

---

## 11. Summary: Core Principles

| Principle | What It Means |
|-----------|---------------|
| **Docs first** | Design specs before code; prompts are engineered |
| **Phases** | Build incrementally, each phase works standalone |
| **Annotations** | Code tells you when and why it was added |
| **Types first** | Define the shape before the behavior |
| **Abstraction** | Import from index, not implementation files |
| **Separation** | AI generates art, canvas composes final output |
| **Context not props** | Shared state via React Context |
| **No persistence** | Client-only, memory-only for V1 |
| **Definition of Done** | Build + Lint + Test + No secrets |

---

## 12. File Locations Quick Reference

| What | Where |
|------|-------|
| Product specs | `../spritify/spritify-docs/product/` |
| World definitions (spec) | `../spritify/spritify-docs/worlds/` |
| World definitions (code) | `src/lib/worlds/` |
| Visual specs | `../spritify/spritify-docs/visuals/` |
| Prompt architecture (spec) | `../spritify/spritify-docs/prompts/` |
| Prompt code | `src/lib/ai/prompts.ts` |
| Card composition | `src/lib/card/compose.ts` |
| Main flow component | `src/components/Panel01PhotoInput.tsx` |
| State management | `src/context/PhotoContext.tsx` |
| API endpoint | `src/app/api/generate/route.ts` |

---

*Last updated: V1.0.0 Launch*
