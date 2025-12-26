#!/usr/bin/env python3
"""
SPRITE FORGE — Prompt Tester

Test image generation prompts interactively.
Paste prompts directly, see results as PNG files.

Usage:
    python prompt_tester.py                    # Interactive mode (paste prompts)
    python prompt_tester.py --photo path.jpg   # Use custom photo
    python prompt_tester.py --card             # Test card prompt only
    python prompt_tester.py --scene            # Test scene prompt only

Output:
    output/card_TIMESTAMP.png
    output/scene_TIMESTAMP.png
"""

import os
import sys
import base64
import argparse
import mimetypes
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' library not found.")
    print("Install it with: pip install requests")
    sys.exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_TEST_PHOTO = "test_photo.jpg"
OUTPUT_FOLDER = "output"
DEFAULT_MODEL = "bytedance-seed/seedream-4.5"

# Output dimensions
CARD_WIDTH = 1728
CARD_HEIGHT = 2304
SCENE_WIDTH = 2560
SCENE_HEIGHT = 1440


# =============================================================================
# CORE FUNCTIONS
# =============================================================================

def load_env():
    """Load environment variables from .env.local"""
    env_path = Path(__file__).parent.parent / ".env.local"
    env_vars = {}

    if env_path.exists():
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip()

    return env_vars


def load_image(image_path: str) -> tuple[str, str]:
    """Load image and return (base64_data, mime_type)"""
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    mime_type, _ = mimetypes.guess_type(str(path))
    if not mime_type or not mime_type.startswith("image/"):
        mime_type = "image/jpeg"

    with open(path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    return image_data, mime_type


def generate_image(
    api_key: str,
    model: str,
    image_base64: str,
    mime_type: str,
    prompt: str,
    timeout: int = 120,
    width: int = None,
    height: int = None,
    debug: bool = False
) -> dict:
    """Call OpenRouter API to generate an image."""

    # Prepend dimension instructions to prompt
    dimension_instruction = ""
    if width and height:
        orientation = "portrait (taller than wide)" if height > width else "landscape (wider than tall)"
        dimension_instruction = f"""OUTPUT IMAGE SPECIFICATIONS:
- Exact dimensions: {width}x{height} pixels
- Aspect ratio: {width}:{height}
- Orientation: {orientation}
- DO NOT generate a square image

"""

    full_prompt = dimension_instruction + prompt

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": full_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 4096
    }

    # Add image size if specified
    # V2: image_size object + image_config.aspect_ratio (no conflicting presets)
    if width and height:
        from math import gcd
        divisor = gcd(width, height)
        aspect_ratio = f"{width // divisor}:{height // divisor}"

        # Seedream format: image_size object (primary authority for dimensions)
        payload["image_size"] = {
            "width": width,
            "height": height
        }
        # Add aspect_ratio hint but NOT image_size preset
        payload["image_config"] = {
            "aspect_ratio": aspect_ratio
        }
        # Note: We intentionally do NOT include image_config.image_size preset
        # as it can conflict with explicit dimensions on some providers

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://sprite-forge.app",
        "X-Title": "SPRITE FORGE Prompt Tester"
    }

    if debug:
        print(f"\n[DEBUG] Sending payload (without image data):")
        debug_payload = {k: v for k, v in payload.items() if k != "messages"}
        print(f"  {debug_payload}")
        print(f"  Prompt length: {len(full_prompt)} chars")

    response = requests.post(
        OPENROUTER_API_URL,
        headers=headers,
        json=payload,
        timeout=timeout
    )

    if debug:
        print(f"[DEBUG] Response status: {response.status_code}")

    if not response.ok:
        return {
            "success": False,
            "error": f"HTTP {response.status_code}: {response.text[:200]}"
        }

    data = response.json()

    if debug:
        print(f"[DEBUG] Response keys: {list(data.keys())}")
        if "choices" in data and len(data["choices"]) > 0:
            msg = data["choices"][0].get("message", {})
            print(f"[DEBUG] Message keys: {list(msg.keys())}")
            if "images" in msg:
                print(f"[DEBUG] Images count: {len(msg['images'])}")

    message = data.get("choices", [{}])[0].get("message", {})

    # Check message.images[] first (Gemini/Seedream format)
    images = message.get("images", [])
    if images and len(images) > 0:
        img = images[0]

        if "image_url" in img and "url" in img["image_url"]:
            url = img["image_url"]["url"]
            if url.startswith("data:"):
                parts = url.split(",", 1)
                if len(parts) == 2:
                    mime = parts[0].split(":")[1].split(";")[0]
                    return {
                        "success": True,
                        "image_base64": parts[1],
                        "mime_type": mime
                    }

        if "inline_data" in img:
            return {
                "success": True,
                "image_base64": img["inline_data"].get("data", ""),
                "mime_type": img["inline_data"].get("mime_type", "image/png")
            }

        if "data" in img:
            return {
                "success": True,
                "image_base64": img["data"],
                "mime_type": img.get("mime_type", "image/png")
            }

    # Check content array
    content = message.get("content", "")
    if isinstance(content, list):
        for item in content:
            if item.get("type") in ["output_image", "image", "image_url"]:
                if "inline_data" in item:
                    return {
                        "success": True,
                        "image_base64": item["inline_data"].get("data", ""),
                        "mime_type": item["inline_data"].get("mime_type", "image/png")
                    }
                if "data" in item:
                    return {
                        "success": True,
                        "image_base64": item["data"],
                        "mime_type": item.get("mime_type", "image/png")
                    }

    if isinstance(content, str) and content:
        return {
            "success": False,
            "error": f"Model returned text instead of image: {content[:200]}"
        }

    return {
        "success": False,
        "error": "No image in response"
    }


def save_image(base64_data: str, output_path: str):
    """Save base64 image data to file."""
    image_bytes = base64.b64decode(base64_data)
    with open(output_path, "wb") as f:
        f.write(image_bytes)


def get_multiline_input(prompt_text: str) -> str:
    """Get multiline input from user. End with empty line or Ctrl+D."""
    print(prompt_text)
    print("(Paste your prompt, then press Enter twice to submit)")
    print("-" * 40)

    lines = []
    empty_count = 0

    try:
        while True:
            line = input()
            if line == "":
                empty_count += 1
                if empty_count >= 1:  # Single empty line to submit
                    break
                lines.append(line)
            else:
                empty_count = 0
                lines.append(line)
    except EOFError:
        pass

    return "\n".join(lines).strip()


def run_interactive(api_key: str, model: str, image_base64: str, mime_type: str,
                    output_dir: Path, mode: str = "both", timeout: int = 120, debug: bool = False):
    """Run interactive prompt testing loop."""

    print("\n" + "=" * 60)
    print("INTERACTIVE MODE")
    print("=" * 60)
    print("Commands:")
    print("  Type 'quit' or 'exit' to stop")
    print("  Type 'card' to switch to card-only mode")
    print("  Type 'scene' to switch to scene-only mode")
    print("  Type 'both' to generate both (asks for 2 prompts)")
    print("=" * 60)

    current_mode = mode

    while True:
        print(f"\n[Mode: {current_mode.upper()}]")

        # BOTH mode: ask for two separate prompts
        if current_mode == "both":
            # Get CARD prompt
            card_prompt = get_multiline_input("\n[1/2] Paste your CARD prompt (portrait):")

            if not card_prompt:
                print("Empty prompt, skipping...")
                continue

            # Check for commands
            cmd = card_prompt.lower().strip()
            if cmd in ["quit", "exit", "q"]:
                print("\nGoodbye!")
                break
            elif cmd == "card":
                current_mode = "card"
                print("Switched to CARD mode")
                continue
            elif cmd == "scene":
                current_mode = "scene"
                print("Switched to SCENE mode")
                continue

            # Get SCENE prompt
            scene_prompt = get_multiline_input("\n[2/2] Paste your SCENE prompt (landscape):")

            if not scene_prompt:
                print("Empty scene prompt, skipping...")
                continue

            # Check for commands in scene prompt too
            cmd = scene_prompt.lower().strip()
            if cmd in ["quit", "exit", "q"]:
                print("\nGoodbye!")
                break
            elif cmd == "card":
                current_mode = "card"
                print("Switched to CARD mode")
                continue
            elif cmd == "scene":
                current_mode = "scene"
                print("Switched to SCENE mode")
                continue

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Generate CARD
            print(f"\nGenerating CARD ({CARD_WIDTH}x{CARD_HEIGHT})...")
            result = generate_image(
                api_key=api_key,
                model=model,
                image_base64=image_base64,
                mime_type=mime_type,
                prompt=card_prompt,
                timeout=timeout,
                width=CARD_WIDTH,
                height=CARD_HEIGHT,
                debug=debug
            )

            if result["success"]:
                card_path = output_dir / f"card_{timestamp}.png"
                save_image(result["image_base64"], str(card_path))
                print(f"SUCCESS: {card_path}")
            else:
                print(f"FAILED: {result['error']}")

            # Generate SCENE
            print(f"\nGenerating SCENE ({SCENE_WIDTH}x{SCENE_HEIGHT})...")
            result = generate_image(
                api_key=api_key,
                model=model,
                image_base64=image_base64,
                mime_type=mime_type,
                prompt=scene_prompt,
                timeout=timeout,
                width=SCENE_WIDTH,
                height=SCENE_HEIGHT,
                debug=debug
            )

            if result["success"]:
                scene_path = output_dir / f"scene_{timestamp}.png"
                save_image(result["image_base64"], str(scene_path))
                print(f"SUCCESS: {scene_path}")
            else:
                print(f"FAILED: {result['error']}")

        else:
            # Single mode: card or scene
            prompt_label = "CARD prompt (portrait)" if current_mode == "card" else "SCENE prompt (landscape)"
            prompt = get_multiline_input(f"\nPaste your {prompt_label}:")

            if not prompt:
                print("Empty prompt, skipping...")
                continue

            # Check for commands
            cmd = prompt.lower().strip()
            if cmd in ["quit", "exit", "q"]:
                print("\nGoodbye!")
                break
            elif cmd == "card":
                current_mode = "card"
                print("Switched to CARD mode")
                continue
            elif cmd == "scene":
                current_mode = "scene"
                print("Switched to SCENE mode")
                continue
            elif cmd == "both":
                current_mode = "both"
                print("Switched to BOTH mode (will ask for 2 prompts)")
                continue

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            if current_mode == "card":
                print(f"\nGenerating CARD ({CARD_WIDTH}x{CARD_HEIGHT})...")
                result = generate_image(
                    api_key=api_key,
                    model=model,
                    image_base64=image_base64,
                    mime_type=mime_type,
                    prompt=prompt,
                    timeout=timeout,
                    width=CARD_WIDTH,
                    height=CARD_HEIGHT,
                    debug=debug
                )

                if result["success"]:
                    card_path = output_dir / f"card_{timestamp}.png"
                    save_image(result["image_base64"], str(card_path))
                    print(f"SUCCESS: {card_path}")
                else:
                    print(f"FAILED: {result['error']}")

            elif current_mode == "scene":
                print(f"\nGenerating SCENE ({SCENE_WIDTH}x{SCENE_HEIGHT})...")
                result = generate_image(
                    api_key=api_key,
                    model=model,
                    image_base64=image_base64,
                    mime_type=mime_type,
                    prompt=prompt,
                    timeout=timeout,
                    width=SCENE_WIDTH,
                    height=SCENE_HEIGHT,
                    debug=debug
                )

                if result["success"]:
                    scene_path = output_dir / f"scene_{timestamp}.png"
                    save_image(result["image_base64"], str(scene_path))
                    print(f"SUCCESS: {scene_path}")
                else:
                    print(f"FAILED: {result['error']}")

        print("\n" + "-" * 40)
        print("Ready for next prompt (or type 'quit' to exit)")


def main():
    parser = argparse.ArgumentParser(
        description="SPRITE FORGE Prompt Tester - Interactive Mode",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python prompt_tester.py                  # Interactive, paste prompts
    python prompt_tester.py --photo me.jpg   # Use specific photo
    python prompt_tester.py --card           # Card prompts only
    python prompt_tester.py --scene          # Scene prompts only
        """
    )
    parser.add_argument("--photo", help="Path to test photo", default=None)
    parser.add_argument("--card", action="store_true", help="Test card prompts only")
    parser.add_argument("--scene", action="store_true", help="Test scene prompts only")
    parser.add_argument("--model", help="Override model name", default=None)
    parser.add_argument("--timeout", type=int, default=120, help="Request timeout in seconds")
    parser.add_argument("--debug", action="store_true", help="Show debug output")

    args = parser.parse_args()

    # Determine mode
    if args.card and args.scene:
        mode = "both"
    elif args.card:
        mode = "card"
    elif args.scene:
        mode = "scene"
    else:
        mode = "both"

    # Load environment
    env = load_env()
    api_key = env.get("OPENROUTER_API_KEY", "")
    model = args.model or env.get("OPENROUTER_MODEL", DEFAULT_MODEL)

    if not api_key or api_key == "your_openrouter_api_key_here":
        print("ERROR: OPENROUTER_API_KEY not set in .env.local")
        sys.exit(1)

    # Determine photo path
    script_dir = Path(__file__).parent
    if args.photo:
        photo_path = Path(args.photo)
        if not photo_path.is_absolute():
            photo_path = script_dir / args.photo
    else:
        photo_path = script_dir / DEFAULT_TEST_PHOTO

    if not photo_path.exists():
        print(f"ERROR: Photo not found: {photo_path}")
        print(f"\nPlace a test photo at: {script_dir / DEFAULT_TEST_PHOTO}")
        print("Or specify a photo with: --photo path/to/photo.jpg")
        sys.exit(1)

    # Create output directory
    output_dir = script_dir / OUTPUT_FOLDER
    output_dir.mkdir(exist_ok=True)

    # Load image
    print("\n" + "=" * 60)
    print("SPRITE FORGE — Prompt Tester")
    print("=" * 60)
    print(f"Model:  {model}")
    print(f"Photo:  {photo_path}")
    print(f"Output: {output_dir}/")
    print("=" * 60)

    try:
        image_base64, mime_type = load_image(str(photo_path))
        print(f"Loaded image: {mime_type}, {len(image_base64)//1024}KB")
    except Exception as e:
        print(f"ERROR loading image: {e}")
        sys.exit(1)

    # Run interactive mode
    run_interactive(
        api_key=api_key,
        model=model,
        image_base64=image_base64,
        mime_type=mime_type,
        output_dir=output_dir,
        mode=mode,
        timeout=args.timeout,
        debug=args.debug
    )


if __name__ == "__main__":
    main()
