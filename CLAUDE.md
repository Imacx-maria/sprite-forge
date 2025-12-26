# CLAUDE.md — SPRITE FORGE

Project-specific guidance for Claude Code when working in this repository.

---

## Project Overview

**SPRITE FORGE** is a photo-to-pixel-art web app that transforms user photos into:
1. **Player Card** — Collectible character card with frame overlay
2. **World Scene** — Full game screenshot with character in environment

---

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS 4
- **AI Provider**: OpenRouter API
- **AI Model**: `bytedance-seed/seedream-4.5` (configured via env)

---

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

---

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # Main page
│   ├── layout.tsx    # Root layout (fonts)
│   └── api/          # API routes
│       ├── generate/ # AI generation endpoint
│       └── upload/   # Image upload endpoint
├── components/       # React components
├── context/          # React contexts (PhotoContext)
├── lib/              # Business logic
│   ├── ai/           # AI abstraction layer
│   ├── card/         # Card canvas composition
│   ├── worlds/       # World definitions (6 worlds)
│   └── image/        # Image utilities
└── types/            # TypeScript types
```

See `AGENTS.md` files in each directory for detailed patterns.

---

## Key Conventions

### Imports
- Use `@/*` path alias (maps to `./src/*`)
- Import from barrel `index.ts` files, not individual modules
- AI: Import from `@/lib/ai`, NOT `@/lib/ai/openrouter`

### Components
- All UI components are client-side (`"use client"`)
- Use `usePhoto()` hook for shared state
- Functional components only

### Styling
- Tailwind classes only — no CSS modules
- Dark theme: `bg-[#0a0a0a]`
- Text: `text-white`, `text-[#888888]`, `text-[#666666]`
- Font: VT323 (pixel font) for card text

---

## Environment Variables

Required in `.env.local`:
```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=bytedance-seed/seedream-4.5
NEXT_PUBLIC_ACCESS_CODE=...
```

---

## Documentation Reference

External design docs (read-only):
```
../sp-forge-docs/
├── prompts/prompt-architecture.md   # How prompts are structured
├── visuals/player-card.md           # Card design spec
├── visuals/world-scene.md           # Scene design spec
├── worlds/*.md                      # World-specific specs
└── identity.md                      # Brand identity
```

**Always check docs before modifying prompts or visual specs.**

---

## Critical Rules

### AI Generation
- Model is configured via `OPENROUTER_MODEL` env var
- Use `generateDualOutput()` for both outputs in parallel
- Never import directly from `openrouter.ts` — use `@/lib/ai`

### Card Composition
- Cards are composed client-side using canvas
- Dimensions locked at 1024×1408
- Frame PNGs are in `public/frames/`
- VT323 font must be loaded before composition

### Worlds
- 6 worlds defined in `src/lib/worlds/`
- Each world has: `promptModifier`, `scenePromptModifier`, `sceneCamera`, `cardTitles`
- Use `getWorld(id)` to fetch by ID
- Use `getRandomCardTitle(world)` for card titles

---

## Common Gotchas

1. **Photo not converting to pixel art?** — Check the prompt in `src/lib/ai/prompts.ts`. The AI might be compositing instead of converting.

2. **Card text wrong size/position?** — Edit `src/lib/card/types.ts` (CARD_DIMENSIONS.TEXT)

3. **New world not appearing?** — Add to `WORLDS` array in `src/lib/worlds/index.ts`

4. **Font not rendering?** — VT323 must be loaded in `layout.tsx` and the font family string must include fallback

---

## Pre-PR Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No TypeScript errors
- [ ] Tested in browser
- [ ] No hardcoded API keys
- [ ] Card composition renders correctly
- [ ] Both outputs (card + scene) generate successfully
