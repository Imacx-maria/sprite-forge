# SPRITE FORGE Documentation

This folder contains implementation documentation and links to the canonical design specs.

---

## This Folder

| Document | Purpose |
|----------|---------|
| `README.md` | This index file |
| `DEVELOPMENT-PROCESS.md` | **Development methodology, work ethic, and onboarding guide** |
| `V1-COMPLETION-PLAN.md` | **Remaining V1 work: Phases 9-12 with implementation tasks** |

---

## Design Specifications (External)

The complete product specification lives in a separate docs folder:

```
../spritify/spritify-docs/
```

### Key Design Documents

| Document | Purpose |
|----------|---------|
| `product/overview.md` | One-page product explanation |
| `product/core-principles.md` | Non-negotiable product rules |
| `product/user-flow.md` | Step-by-step user experience |
| `visuals/player-card.md` | Player Card design system |
| `visuals/world-scene.md` | World Scene design system |
| `prompts/prompt-architecture.md` | Image generation prompt structure |
| `worlds/*.md` | Per-world visual specs |
| `decisions/locked-decisions.md` | Decisions that should not be revisited |

### Reading Order for New Devs

1. `product/overview.md`
2. `product/core-principles.md`
3. `product/user-flow.md`
4. `visuals/player-card.md`
5. `visuals/world-scene.md`
6. `prompts/prompt-architecture.md`

---

## Implementation Documentation (In Codebase)

| Location | Purpose |
|----------|---------|
| `/CLAUDE.md` | AI assistant rules (root) |
| `/AGENTS.md` | Project overview, universal conventions |
| `/src/app/AGENTS.md` | App Router patterns, API routes |
| `/src/components/AGENTS.md` | Component patterns, styling |
| `/src/lib/AGENTS.md` | Business logic, module rules |

---

## Documentation Rules

1. **Design specs are canonical** — if it's not in `spritify-docs`, it's not locked
2. **AGENTS.md files are living docs** — updated alongside code changes
3. **Phase annotations in code** — every file notes which phase created/modified it
4. **Text specifications override visual references**
