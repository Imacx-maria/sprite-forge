# SPRITE FORGE — Agent Instructions

> Photo-to-pixel-art web app. Next.js 16 + React 19 + TypeScript + Tailwind CSS 4.
> AI generation via OpenRouter. Single project, not monorepo.

---

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
```

---

## Project Structure

```
src/
├── app/           → Next.js App Router    [see src/app/AGENTS.md]
├── components/    → React components      [see src/components/AGENTS.md]
├── lib/           → Business logic        [see src/lib/AGENTS.md]
├── context/       → React contexts
└── types/         → TypeScript types
```

---

## Universal Conventions

### Code Style
- TypeScript strict mode (no `any` unless unavoidable)
- Functional components only (no class components)
- `"use client"` directive required for client components
- Barrel exports via `index.ts` in each folder
- Use `@/*` path alias for imports (maps to `./src/*`)

### Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `PascalCase` for interfaces, `camelCase` for type aliases
- Files: Match the default export name

### Commits
- Conventional commits preferred: `feat:`, `fix:`, `refactor:`, `docs:`
- Keep commits atomic and focused

---

## Environment Variables

Required in `.env.local`:
```
OPENROUTER_API_KEY=sk-or-...        # OpenRouter API key
OPENROUTER_MODEL=bytedance-seed/seedream-4.5  # AI model
NEXT_PUBLIC_ACCESS_CODE=...         # Phase 0 access gate
```

**Never commit real API keys.**

---

## JIT Index — Quick Find

### Search Commands
```bash
# Find a component
rg -n "export.*function.*Component" src/components/

# Find a world definition
rg -n "export const.*World" src/lib/worlds/

# Find API routes
rg -n "export async function (GET|POST)" src/app/api/

# Find React hooks
rg -n "export.*use[A-Z]" src/

# Find types
rg -n "export (interface|type)" src/types/
```

### Key Files
| Purpose | File |
|---------|------|
| Main page | `src/app/page.tsx` |
| Photo context | `src/context/PhotoContext.tsx` |
| AI generation | `src/lib/ai/index.ts` |
| Card composition | `src/lib/card/compose.ts` |
| World definitions | `src/lib/worlds/*.ts` |
| Prompts | `src/lib/ai/prompts.ts` |

---

## Definition of Done

Before PR:
1. `npm run build` passes
2. `npm run lint` passes
3. No TypeScript errors
4. Tested manually in browser
5. No hardcoded secrets

---

## Documentation Reference

External docs (read-only reference):
```
../spritify/spritify-docs/
├── prompts/prompt-architecture.md  # Prompt structure rules
├── visuals/player-card.md          # Card design spec
├── visuals/world-scene.md          # Scene design spec
├── worlds/*.md                     # World-specific specs
└── identity.md                     # Brand identity
```

---

## Gotchas

- **AI model**: Currently `bytedance-seed/seedream-4.5` for best pixel art. Model is configured via env var.
- **VT323 font**: Used for all card text. Loaded via Google Fonts in `layout.tsx`.
- **Canvas composition**: Player Cards are composed client-side using canvas (see `src/lib/card/compose.ts`).
- **Dual generation**: Both Player Card and World Scene are generated in parallel.
