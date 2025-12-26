# src/lib/ — Business Logic

Core business logic. No React components here — pure TypeScript.

---

## Structure

```
lib/
├── ai/              # AI generation abstraction
│   ├── index.ts     # Public API (generateDualOutput, etc.)
│   ├── openrouter.ts # OpenRouter provider implementation
│   ├── prompts.ts   # Prompt templates
│   └── types.ts     # AI-related types
│
├── card/            # Player card composition
│   ├── index.ts     # Public API
│   ├── compose.ts   # Canvas composition logic
│   └── types.ts     # Card dimensions, colors, types
│
├── worlds/          # World definitions
│   ├── index.ts     # Public API (getWorld, getAllWorlds)
│   ├── types.ts     # WorldDefinition interface
│   ├── street-brawler.ts
│   ├── fantasy-rpg.ts
│   ├── gothic-hunter.ts
│   ├── space-marine.ts
│   ├── candy-land.ts
│   └── galactic-overlord.ts
│
└── image/           # Image utilities
    ├── index.ts
    └── resize.ts    # Image resizing
```

---

## Module Rules

### AI (`lib/ai/`)
- **DO** import from `@/lib/ai` (the index)
- **DON'T** import from `@/lib/ai/openrouter` directly
- Provider abstraction allows easy model switching

```typescript
// ✅ Correct
import { generateDualOutput, isConfigured } from "@/lib/ai";

// ❌ Wrong
import { createOpenRouterProvider } from "@/lib/ai/openrouter";
```

### Card (`lib/card/`)
- Canvas-based composition runs client-side only
- `composePlayerCard()` returns a data URL
- Card dimensions locked at 1024×1408

### Worlds (`lib/worlds/`)
- Each world is a separate file
- All worlds exported via `WORLDS` array in index
- Use `getWorld(id)` to get by ID

---

## Key Functions

| Module | Function | Purpose |
|--------|----------|---------|
| `ai` | `generateDualOutput()` | Generate both Player Card and World Scene |
| `ai` | `isConfigured()` | Check if API key is set |
| `card` | `composePlayerCard()` | Compose card layers on canvas |
| `card` | `downloadCard()` | Trigger PNG download |
| `worlds` | `getWorld(id)` | Get world definition by ID |
| `worlds` | `getAllWorlds()` | Get all available worlds |
| `worlds` | `getRandomCardTitle()` | Random title from world's cardTitles |

---

## Commands

```bash
# Find all exports from lib
rg -n "export (function|const|async)" src/lib/

# Find world definitions
rg -n "export const.*: WorldDefinition" src/lib/worlds/

# Find prompt builders
rg -n "export function build.*Prompt" src/lib/ai/
```

---

## AI Generation Flow

```
1. User uploads photo
2. User selects world
3. Frontend calls POST /api/generate
4. API calls generateDualOutput(image, mimeType, world)
5. generateDualOutput() builds prompts from world definition
6. OpenRouter provider sends requests in parallel
7. Both results returned (partial success allowed)
8. Frontend displays results + allows download
```

---

## Prompts Architecture

Prompts are built from:
1. **Base template** (in `prompts.ts`)
2. **World modifier** (`world.promptModifier` for card, `world.scenePromptModifier` for scene)
3. **Camera rules** (`world.sceneCamera` for scene)

See `../sp-forge-docs/prompts/prompt-architecture.md` for full spec.

---

## Gotchas

- **Model**: Set via `OPENROUTER_MODEL` env var. Default is outdated — use `bytedance-seed/seedream-4.5`
- **Parallel generation**: Both outputs generated simultaneously via `Promise.all`
- **Canvas**: Requires browser environment (document.createElement)
- **Font loading**: VT323 must be loaded before card composition
