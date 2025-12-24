# SPRITE FORGE

**Turn selfies into pixel-perfect game memories.**

SPRITE FORGE transforms real photos into retro game characters and places them inside playable-feeling game worlds.

## What It Does

1. Upload a photo (or capture with webcam)
2. Choose a game world
3. Name your character
4. Receive two pixel-art outputs:
   - **World Scene** — a 16:9 landscape that looks like a paused game screenshot
   - **Player Card** — a vertical collectible character card

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Image Generation**: Replicate API
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Replicate API token

### Installation

```bash
# Clone the repository
git clone https://github.com/Imacx-maria/sprite-forge.git
cd sprite-forge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Replicate API token to .env.local
# REPLICATE_API_TOKEN=your_token_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
sprite-forge/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/      # Photo upload endpoint
│   │   │   └── generate/    # Image generation endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/          # UI components (TBD)
│   ├── lib/                 # Utilities (TBD)
│   └── types/               # TypeScript types (TBD)
├── docs/                    # Documentation
├── public/                  # Static assets
└── .env.example             # Environment template
```

## Documentation

See the `docs/` folder for complete product specifications, including:

- Product principles
- Panel flow definitions
- World specifications
- Visual systems

## Status

🚧 **Phase 0: Setup Complete**

- [x] GitHub repository
- [x] Next.js initialized
- [x] Tailwind configured
- [x] API route stubs
- [ ] UI implementation
- [ ] Replicate integration
- [ ] Deployment

## License

Private — not for redistribution.

## Documentation

Project documentation and design specs live in the separate docs folder/repo:
SPRITIFY (Phase 0 source of truth)

These docs define the system.
This repository implements it.