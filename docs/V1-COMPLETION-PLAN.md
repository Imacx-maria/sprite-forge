# SPRITE FORGE V1 — Completion Plan

> **Status:** In Progress
> **Created:** 2025-12-26
> **Updated:** 2025-12-26
> **Purpose:** Track remaining work to complete V1 according to spec

---

## Overview

V1 is approximately **85% complete**. Core functionality works (photo input, generation, downloads, two-step reveal). What remains is primarily **stats system update**, **onboarding flow**, and **UI copy polish**.

This document organizes remaining work into **4 phases** (9-12) that continue the existing phase numbering system.

---

## Completion Status Summary

| Category | Done | Remaining |
|----------|------|-----------|
| Core Generation | ✅ | — |
| Photo Input | ✅ | — |
| World System | ✅ | Stats update needed |
| Card Composition | ✅ | Footer text, 4 stats |
| Two-Step Reveal | ✅ | **DONE (Phase 9)** |
| Onboarding | ❌ | Full implementation |
| UI Copy | ⚠️ | Align with spec |
| Loading Messages | ⚠️ | Add rotation |

---

## PHASE 9: Two-Step Reveal Flow ✅ COMPLETE

**Priority:** HIGH
**Effort:** Medium
**Status:** **IMPLEMENTED** (2025-12-26)
**Files Changed:** `Panel01PhotoInput.tsx`, `PhotoContext.tsx`, + 3 new components

### What Was Implemented

1. **RevealState State Machine** in PhotoContext
   - States: `idle` → `generating` → `scene_reveal` → `transition` → `card_reveal`
   - Exported type for use in components
   - `advanceReveal()` and `resetReveal()` actions

2. **No Partial Success** - generatePixelArt now enforces BOTH outputs must succeed
   - If either fails, shows single error message: "Something went wrong in this timeline."
   - User stays in idle state, can retry

3. **Panel04WorldSceneReveal** component
   - Full-screen World Scene display
   - Title: "YOU SPAWNED INTO THE WORLD"
   - World-specific subtitles
   - Single "CONTINUE" button
   - No downloads

4. **Panel05Transition** component
   - Dark background with scanline overlay
   - Subtle pulsing blocks animation
   - Auto-advance after 1.5s OR click to skip

5. **Panel06PlayerCardReveal** component
   - Player Card prominently displayed
   - Title: "YOUR PLAYER CARD"
   - Helper: "This one's yours."
   - Download buttons for both card and scene
   - "WHAT'S NEXT?" section with replay options
   - Edit name/stats inline

### Implementation Tasks (All Complete)

```
[x] Create reveal state machine in PhotoContext
[x] Enforce both outputs must succeed (no partial success)
[x] Create Panel04WorldSceneReveal component
[x] Create Panel05Transition component
[x] Create Panel06PlayerCardReveal component
[x] Update Panel01PhotoInput to delegate to reveal panels
[x] Add world-specific subtitles
[x] Export new components from index.ts
```

### Acceptance Criteria (All Met)

- [x] World Scene shown ALONE first
- [x] User must click CONTINUE to see Player Card
- [x] Player Card shown ALONE after continue
- [x] Downloads only appear after card reveal
- [x] No partial success UI exists (both outputs required)
- [x] Transition feels like "system reconfiguring"
- [x] Flow is linear, no skipping ahead

---

## PHASE 10: Onboarding Flow

**Priority:** MEDIUM
**Effort:** Medium
**Files Affected:** New components, `page.tsx`

### What Spec Says

From `product/onboarding.md`:

**3 Screens (skippable):**

1. **Screen 1 - Welcome**
   - Title: "Turn yourself into a game character"
   - Subtitle: "Choose a world. Spawn in."
   - Button: "Start"

2. **Screen 2 - How It Works**
   - Three steps, horizontal or vertical:
     1. "Choose a photo" — Upload one or take one now.
     2. "Pick a world" — Each world changes the story.
     3. "Get your game moment" — A scene + a player card.
   - Button: "Continue"

3. **Screen 3 - What You Get**
   - Preview of World Scene + Player Card (illustrative)
   - Copy: "Same character. Different universe."
   - Button: "Let's go"

### Current State

- No onboarding exists
- User goes directly to title screen → main flow

### Implementation Tasks

```
[ ] Create OnboardingScreen1Welcome component
    - Title: "Turn yourself into a game character"
    - Subtitle: "Choose a world. Spawn in."
    - "Start" button
    - Skip link (small, unobtrusive)

[ ] Create OnboardingScreen2HowItWorks component
    - Three-step visual (icons + text)
    - One line per step max
    - "Continue" button
    - Skip link

[ ] Create OnboardingScreen3WhatYouGet component
    - Two preview cards (illustrative, not real)
    - "Same character. Different universe."
    - "Let's go" button

[ ] Create OnboardingFlow container
    - Manages current screen (1, 2, 3)
    - Handles skip to main app
    - Stores "onboarding_completed" in sessionStorage

[ ] Update page.tsx routing
    - Check if first visit (no sessionStorage flag)
    - Show onboarding → then Panel00 → main flow
    - Skip onboarding on return visits

[ ] Create placeholder preview images
    - Static World Scene preview
    - Static Player Card preview
    - Store in public/onboarding/
```

### Acceptance Criteria

- [ ] First-time visitors see 3 onboarding screens
- [ ] Return visitors skip directly to app
- [ ] Skip works at any point without confirmation
- [ ] Tone is friendly, calm, playful
- [ ] No technical language anywhere

---

## PHASE 11: Stats System Update

**Priority:** MEDIUM
**Effort:** Small
**Files Affected:** `lib/worlds/*.ts`, `lib/card/types.ts`, `lib/card/compose.ts`, `NameInput.tsx`

### What Spec Says

From `visuals/player-card.md` and world specs:

Each world has **4 unique stats** (cosmetic only):

| World | Stat 1 | Stat 2 | Stat 3 | Stat 4 |
|-------|--------|--------|--------|--------|
| Fantasy RPG | HP: 150 | MP: 50 | Vibes: High | Luck: ??? |
| Street Brawler | HP: 180 | Power: High | Speed: Medium | Vibes: Aggressive |
| Space Marine | Integrity: High | Firepower: Medium | Focus: Max | Vibes: Tactical |
| Gothic Hunter | Resolve: High | Focus: Steady | Darkness: Tolerant | Vibes: Dramatic |
| Candy Land | Joy: High | Energy: Bubbly | Curiosity: Max | Vibes: Sweet |
| Galactic Overlord | Immortality: ∞ | Power Level: Unmeasurable | Mind Control: Enabled | Vibes: Cosmic |

### Current State

- Only 2 stats: POWER (60-99), SPEED (60-99)
- Same stats for all worlds
- Stats displayed in NameInput and on card

### Implementation Tasks

```
[ ] Update WorldDefinition type
    - Add: stats: StatDefinition[]
    - StatDefinition = { label: string; value: string | number }

[ ] Update each world file with 4 stats
    - fantasy-rpg.ts: HP, MP, Vibes, Luck
    - street-brawler.ts: HP, Power, Speed, Vibes
    - space-marine.ts: Integrity, Firepower, Focus, Vibes
    - gothic-hunter.ts: Resolve, Focus, Darkness, Vibes
    - candy-land.ts: Joy, Energy, Curiosity, Vibes
    - galactic-overlord.ts: Immortality, Power Level, Mind Control, Vibes

[ ] Update card composition
    - Render 4 stats instead of 2
    - Adjust layout for additional stats
    - May need smaller font or 2x2 grid

[ ] Update NameInput component
    - Show 4 stats from selected world
    - Stats are read-only (no randomization needed per spec)
    - OR: Keep randomization but use world-appropriate ranges

[ ] Update PhotoContext
    - Remove playerStats state OR
    - Make playerStats derive from selectedWorld
```

### Acceptance Criteria

- [ ] Each world displays its unique 4 stats
- [ ] Stats are cosmetic (no gameplay meaning)
- [ ] Card renders all 4 stats legibly
- [ ] Stats match spec exactly

---

## PHASE 12: UI Copy & Polish

**Priority:** LOW
**Effort:** Small
**Files Affected:** Various components

### What Spec Says

From `visuals/system-messages.md`:

All messages must be:
- In-universe (game-like)
- Calm and confident
- Lightly playful
- Never technical
- Never apologetic

### Copy Updates Required

| Location | Current | Spec |
|----------|---------|------|
| Upload idle | — | "Ready when you are." |
| World selection header | — | "Same character. Different universe." |
| Generation loading | "FORGING..." | Rotating messages (see below) |
| Generation footer | — | "Good games take time." |
| Scene reveal title | — | "You spawned into the world" |
| Card reveal title | — | "Your player card" |
| Card reveal helper | — | "This one's yours." |
| Replay section title | — | "What's next?" |
| Replay helper | — | "Same rules. New reality." |
| Replay actions | "TRY AGAIN" / "START OVER" | "Try another world" / "Upload new character" |

### Rotating Loading Messages

**Universal:**
- Generating world…
- Allocating nostalgia…
- Rendering pixels…
- Almost there…

**World-Specific:**

| World | Message 1 | Message 2 | Message 3 |
|-------|-----------|-----------|-----------|
| Fantasy RPG | Building village… | Laying cobblestones… | Assigning quest energy… |
| Street Brawler | Lighting street lamps… | Adding graffiti… | Spawning trouble… |
| Galactic Overlord | Expanding universe… | Aligning planets… | Awakening ancient power… |

### Implementation Tasks

```
[ ] Create loadingMessages.ts
    - Universal messages array
    - World-specific messages map
    - getLoadingMessage(worldId, index) function

[ ] Update generation loading state
    - Rotate messages every 2-3 seconds
    - Mix universal + world-specific
    - Add static footer: "Good games take time."

[ ] Update PhotoUpload component
    - Add idle message: "Ready when you are."

[ ] Update WorldSelector component
    - Add header: "Same character. Different universe."

[ ] Update all reveal/result components
    - Use spec copy exactly
    - Ensure no technical language leaks through

[ ] Add card footer flavor text
    - Per-world optional quotes on Player Card
    - Fantasy RPG: "Every hero starts somewhere."
    - Street Brawler: "No rules. No mercy."
    - Galactic Overlord: "Exiled. Returned. Eternal."
```

### Acceptance Criteria

- [ ] All UI copy matches spec
- [ ] Loading messages rotate
- [ ] No technical language visible
- [ ] Tone is consistently game-like

---

## Forbidden Language (Never Display)

From `visuals/system-messages.md`:

- AI
- model
- API
- request
- server
- error code
- generation failed

All errors must remain narrative:
- "Something went wrong in this timeline."
- "This world is loading slowly."

---

## Implementation Order (Recommended)

```
PHASE 9: Two-Step Reveal Flow    ← Do first (biggest UX change)
PHASE 11: Stats System Update    ← Quick win
PHASE 12: UI Copy & Polish       ← Integrate with Phase 9 work
PHASE 10: Onboarding Flow        ← Last (independent, skippable for soft launch)
```

---

## Definition of Done (V1 Complete)

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Two-step reveal flow works
- [ ] Onboarding shown to first-time users
- [ ] Each world has 4 unique stats
- [ ] All UI copy matches spec
- [ ] Loading messages rotate
- [ ] Card has footer flavor text
- [ ] No technical language in UI
- [ ] Tested in browser (desktop + mobile)
- [ ] All downloads work correctly

---

## Files Quick Reference

| What | Where |
|------|-------|
| Panel routing | `src/app/page.tsx` |
| Main flow component | `src/components/Panel01PhotoInput.tsx` |
| State management | `src/context/PhotoContext.tsx` |
| World definitions | `src/lib/worlds/*.ts` |
| Card composition | `src/lib/card/compose.ts` |
| Card dimensions/colors | `src/lib/card/types.ts` |
| AI prompts | `src/lib/ai/prompts.ts` |
| Spec: system messages | `../spritify/spritify-docs/visuals/system-messages.md` |
| Spec: player card | `../spritify/spritify-docs/visuals/player-card.md` |
| Spec: onboarding | `../spritify/spritify-docs/product/onboarding.md` |
| Spec: panel flow | `../spritify/spritify-docs/app/panel-flow.md` |

---

*Document created for SPRITE FORGE V1 completion tracking.*
