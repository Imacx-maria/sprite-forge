# src/app/ — Next.js App Router

Next.js 16 App Router. Pages, layouts, and API routes.

---

## Structure

```
app/
├── page.tsx           # Main app page (title screen + panels)
├── layout.tsx         # Root layout (fonts, metadata)
├── globals.css        # Tailwind + global styles
├── favicon.ico
└── api/
    ├── generate/route.ts  # POST: AI image generation
    └── upload/route.ts    # POST: Image upload/validation
```

---

## Patterns

### Pages
- Single page app — all panels rendered in `page.tsx`
- Panel navigation via `PhotoContext.goToPanel()`
- State managed in `PhotoProvider`

### API Routes
- Use Next.js Route Handlers (`export async function POST`)
- Validate input before processing
- Return JSON with `{ success, data?, error? }`

### Example API Route
```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // validate & process
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error message" },
      { status: 500 }
    );
  }
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `page.tsx` | Main page, renders `AccessGate` + `Panel01PhotoInput` |
| `layout.tsx` | Root layout, loads VT323 font, sets metadata |
| `api/generate/route.ts` | Calls `generateDualOutput()` from `@/lib/ai` |

---

## Commands

```bash
# Find all API routes
rg -n "export async function (GET|POST|PUT|DELETE)" src/app/api/

# Find page components
rg -n "export default function" src/app/
```

---

## Gotchas

- **Fonts**: VT323 loaded in `layout.tsx` via `next/font/google`
- **Client components**: Most UI is client-side; mark with `"use client"`
- **API keys**: Never expose in client code; API routes run server-side
