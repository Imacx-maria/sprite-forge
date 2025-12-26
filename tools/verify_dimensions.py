#!/usr/bin/env python3
"""
SPRITE FORGE - Dimension Guardrail Test

Verifies that image generation outputs have correct dimensions.
Exits non-zero if dimensions don't match or output is square.

Usage:
    python verify_dimensions.py           # Run full test
    python verify_dimensions.py --quick   # Skip generation, check existing files

Exit codes:
    0 = PASS (all dimensions correct)
    1 = FAIL (wrong dimensions or square output)
    2 = ERROR (generation failed or missing dependencies)
"""

import os
import sys
import base64
import mimetypes
import argparse
from pathlib import Path
from datetime import datetime

# Expected dimensions (must match OUTPUT_DIMENSIONS in types.ts)
CARD_WIDTH = 1728
CARD_HEIGHT = 2304
SCENE_WIDTH = 2560
SCENE_HEIGHT = 1440

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "bytedance-seed/seedream-4.5"


def load_env():
    """Load environment variables from .env.local"""
    env_path = Path(__file__).parent.parent / ".env.local"
    env_vars = {}
    if env_path.exists():
        for line in open(env_path):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip()
    return env_vars


def generate_image(api_key, model, image_b64, mime, prompt, width, height):
    """Generate image with explicit dimensions (Seedream format)."""
    try:
        import requests
    except ImportError:
        print("ERROR: requests library not installed")
        sys.exit(2)

    from math import gcd
    divisor = gcd(width, height)
    aspect_ratio = f"{width // divisor}:{height // divisor}"

    # V2: image_size object + image_config.aspect_ratio
    # NO image_config.image_size preset (that can conflict!)
    payload = {
        "model": model,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{image_b64}"}}
            ]
        }],
        "max_tokens": 4096,
        "image_size": {"width": width, "height": height},
        "image_config": {"aspect_ratio": aspect_ratio}
    }

    # GUARDRAIL: Verify no conflicting image_config.image_size preset
    if "image_size" in payload.get("image_config", {}):
        print("GUARDRAIL FAIL: Payload contains conflicting image_config.image_size preset")
        sys.exit(1)

    response = requests.post(
        OPENROUTER_API_URL,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://sprite-forge.app",
            "X-Title": "SPRITE FORGE Dimension Test"
        },
        json=payload,
        timeout=180
    )

    if not response.ok:
        print(f"API Error: {response.status_code} - {response.text[:200]}")
        return None

    msg = response.json().get("choices", [{}])[0].get("message", {})
    imgs = msg.get("images", [])

    if imgs and "image_url" in imgs[0]:
        url = imgs[0]["image_url"]["url"]
        if url.startswith("data:"):
            return url.split(",", 1)[1]

    return None


def get_image_dimensions(filepath):
    """Get dimensions from image file."""
    try:
        from PIL import Image
        with Image.open(filepath) as img:
            return img.size
    except ImportError:
        print("ERROR: PIL/Pillow not installed")
        sys.exit(2)


def run_test(skip_generation=False):
    """Run dimension verification test."""
    print("=" * 70)
    print("SPRITE FORGE - Dimension Guardrail Test")
    print("=" * 70)

    script_dir = Path(__file__).parent
    output_dir = script_dir / "output"
    output_dir.mkdir(exist_ok=True)

    results = []
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if not skip_generation:
        # Load environment
        env = load_env()
        api_key = env.get("OPENROUTER_API_KEY", "")
        model = env.get("OPENROUTER_MODEL", DEFAULT_MODEL)

        if not api_key:
            print("ERROR: OPENROUTER_API_KEY not set")
            sys.exit(2)

        # Load test photo
        photo = script_dir / "test_photo.jpg"
        if not photo.exists():
            print(f"ERROR: Test photo not found: {photo}")
            sys.exit(2)

        mime, _ = mimetypes.guess_type(str(photo))
        img_b64 = base64.b64encode(open(photo, "rb").read()).decode()

        prompt = "Transform this photo into 16-bit pixel art. Output: pure pixel art only."

        # Test CARD
        from math import gcd
        card_div = gcd(CARD_WIDTH, CARD_HEIGHT)
        card_ar = f"{CARD_WIDTH // card_div}:{CARD_HEIGHT // card_div}"
        print(f"\nGenerating CARD ({CARD_WIDTH}x{CARD_HEIGHT})...")
        print(f"  Payload: image_size={{ width: {CARD_WIDTH}, height: {CARD_HEIGHT} }}")
        print(f"  Payload: image_config={{ aspect_ratio: '{card_ar}' }}")
        print(f"  Payload: image_config.image_size = NOT SET (no conflicting preset)")

        card_b64 = generate_image(api_key, model, img_b64, mime, prompt, CARD_WIDTH, CARD_HEIGHT)
        if card_b64:
            card_path = output_dir / f"guardrail_card_{timestamp}.png"
            open(card_path, "wb").write(base64.b64decode(card_b64))
            results.append(("CARD", card_path, CARD_WIDTH, CARD_HEIGHT))
        else:
            print("  CARD generation FAILED")
            results.append(("CARD", None, CARD_WIDTH, CARD_HEIGHT))

        # Test SCENE
        scene_div = gcd(SCENE_WIDTH, SCENE_HEIGHT)
        scene_ar = f"{SCENE_WIDTH // scene_div}:{SCENE_HEIGHT // scene_div}"
        print(f"\nGenerating SCENE ({SCENE_WIDTH}x{SCENE_HEIGHT})...")
        print(f"  Payload: image_size={{ width: {SCENE_WIDTH}, height: {SCENE_HEIGHT} }}")
        print(f"  Payload: image_config={{ aspect_ratio: '{scene_ar}' }}")
        print(f"  Payload: image_config.image_size = NOT SET (no conflicting preset)")

        scene_b64 = generate_image(api_key, model, img_b64, mime, prompt, SCENE_WIDTH, SCENE_HEIGHT)
        if scene_b64:
            scene_path = output_dir / f"guardrail_scene_{timestamp}.png"
            open(scene_path, "wb").write(base64.b64decode(scene_b64))
            results.append(("SCENE", scene_path, SCENE_WIDTH, SCENE_HEIGHT))
        else:
            print("  SCENE generation FAILED")
            results.append(("SCENE", None, SCENE_WIDTH, SCENE_HEIGHT))
    else:
        # Quick mode: check most recent files
        card_files = sorted(output_dir.glob("guardrail_card_*.png"), reverse=True)
        scene_files = sorted(output_dir.glob("guardrail_scene_*.png"), reverse=True)

        if card_files:
            results.append(("CARD", card_files[0], CARD_WIDTH, CARD_HEIGHT))
        if scene_files:
            results.append(("SCENE", scene_files[0], SCENE_WIDTH, SCENE_HEIGHT))

    # Verify results
    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)
    print(f"{'Output':<8} {'Expected':<12} {'Actual':<12} {'Status':<8}")
    print("-" * 70)

    all_pass = True

    for name, filepath, exp_w, exp_h in results:
        if filepath is None:
            print(f"{name:<8} {exp_w}x{exp_h:<6} {'N/A':<12} FAIL (generation failed)")
            all_pass = False
            continue

        actual_w, actual_h = get_image_dimensions(filepath)

        # Check for exact match
        if actual_w == exp_w and actual_h == exp_h:
            status = "PASS"
        else:
            status = "FAIL"
            all_pass = False

        # Additional check: fail if square when shouldn't be
        if actual_w == actual_h and exp_w != exp_h:
            status = "FAIL (square!)"
            all_pass = False

        print(f"{name:<8} {exp_w}x{exp_h:<6} {actual_w}x{actual_h:<6} {status}")

    print("-" * 70)

    if all_pass:
        print("OVERALL: PASS - All dimensions correct")
        print("=" * 70)
        return 0
    else:
        print("OVERALL: FAIL - Dimension mismatch detected")
        print("=" * 70)
        return 1


def main():
    parser = argparse.ArgumentParser(description="Dimension guardrail test")
    parser.add_argument("--quick", action="store_true", help="Check existing files only")
    args = parser.parse_args()

    sys.exit(run_test(skip_generation=args.quick))


if __name__ == "__main__":
    main()
