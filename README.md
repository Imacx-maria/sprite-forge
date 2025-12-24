# SPRITE FORGE

**Turn selfies into pixel-perfect game legends.**

SPRITE FORGE transforms real photos into retro pixel-art game characters with themed world styles.

## What It Does

1. Upload a photo (or capture with webcam)
2. Choose a game world theme
3. Generate your pixel-art character
4. Download your Player Card

## Tech Stack

- **Frontend**: Next.js 16+ (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Generation**: OpenRouter API (Gemini 2.0 Flash)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Bun (runtime and package manager)
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Imacx-maria/sprite-forge.git
cd sprite-forge

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Add your OpenRouter API key to .env.local
# OPENROUTER_API_KEY=your_key_here

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
sprite-forge/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/    # AI generation endpoint
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Main app entry
│   │   └── globals.css      # Design tokens
│   ├── components/          # UI components
│   ├── context/             # State management
│   ├── lib/
│   │   ├── ai/              # AI abstraction layer
│   │   ├── card/            # Card composition
│   │   └── worlds/          # World themes
│   └── types/               # TypeScript types
├── docs/                    # Documentation
├── public/                  # Static assets
└── .env.example             # Environment template
```

## Available Worlds

- Fantasy RPG
- Street Brawler
- Space Marine
- Gothic Hunter
- Candy Land
- Galactic Overlord

## Features

- Photo upload (drag-and-drop or file picker)
- Webcam capture
- 6 themed world styles
- AI-powered pixel-art generation
- Player Card composition
- PNG download
- Per-session generation limit (cost protection)

## Environment Variables

Required:
- `OPENROUTER_API_KEY` - Your OpenRouter API key

Optional:
- `OPENROUTER_MODEL` - AI model (default: google/gemini-2.0-flash-exp:free)
- `NEXT_PUBLIC_ENABLE_WEBCAM` - Enable webcam feature (default: true)

## Status

**v1.0.0 - Launch Ready**

- [x] Photo input (upload + webcam)
- [x] World selection
- [x] AI pixel-art generation
- [x] Player Card composition
- [x] PNG download
- [x] Error handling
- [x] Generation limits

## License

Private - not for redistribution.
