# SPRITE FORGE — Tools

Development and testing utilities.

---

## prompt_tester.py

Interactive prompt testing. Paste prompts, get images.

### Setup

```bash
pip install requests
```

Add a test photo:
```
tools/test_photo.jpg
```

### Usage

```bash
cd tools
python prompt_tester.py
```

### Interactive Mode

```
============================================================
SPRITE FORGE — Prompt Tester
============================================================
Model:  bytedance-seed/seedream-4.5
Photo:  tools/test_photo.jpg
Output: tools/output/
============================================================

INTERACTIVE MODE
============================================================
Commands:
  Type 'quit' or 'exit' to stop
  Type 'card' to switch to card-only mode
  Type 'scene' to switch to scene-only mode
  Type 'both' to generate both
============================================================

[Mode: BOTH]

Paste your prompt:
(Paste your prompt, then press Enter twice to submit)
----------------------------------------
```

1. Paste your prompt
2. Press Enter twice to submit
3. Images saved to `output/` folder
4. Repeat with new prompts

### Commands

While running:
- `card` — switch to card-only mode
- `scene` — switch to scene-only mode
- `both` — generate both card and scene
- `quit` or `exit` — stop

### Options

```bash
python prompt_tester.py --card           # Start in card-only mode
python prompt_tester.py --scene          # Start in scene-only mode
python prompt_tester.py --photo me.jpg   # Use different photo
python prompt_tester.py --model xyz      # Use different model
```

### Output

```
tools/output/card_YYYYMMDD_HHMMSS.png
tools/output/scene_YYYYMMDD_HHMMSS.png
```

---

## Workflow

```
1. Run: python prompt_tester.py
2. Paste a prompt, press Enter twice
3. Open output/ folder, view the PNG
4. Paste next prompt iteration
5. When happy, copy prompt to src/lib/ai/prompts.ts
```
