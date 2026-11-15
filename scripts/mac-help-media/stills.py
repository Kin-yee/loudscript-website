#!/usr/bin/env python3
"""Crop capture.py's raw PNGs to the part each help section points at and
write them as WebP under images/mac/help/.

    python3 scripts/mac-help-media/stills.py --raw /tmp/mac-help-raw --site .
"""

import argparse
import subprocess
from pathlib import Path

# name: (source, crop as WxH+X+Y in 2x pixels)
STILLS = {
    "settings-models-download": ("settings-models.png", "1120x1180+0+0"),
    "settings-models-installed": ("settings-models-remove.png", "1176x1030+0+0"),
    "settings-permissions": ("settings-permissions.png", "1120x620+0+0"),
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw", type=Path, required=True)
    parser.add_argument("--site", type=Path, required=True)
    args = parser.parse_args()
    out = args.site / "images" / "mac" / "help"
    out.mkdir(parents=True, exist_ok=True)
    work = args.raw / "stills"
    work.mkdir(exist_ok=True)
    for name, (source, crop) in STILLS.items():
        cropped = work / f"{name}.png"
        subprocess.run(["magick", str(args.raw / source), "-crop", crop, "+repage", "PNG32:" + str(cropped)],
                       check=True)
        subprocess.run(["cwebp", "-quiet", "-q", "86", "-alpha_q", "100", str(cropped), "-o", str(out / f"{name}.webp")],
                       check=True)
        size = subprocess.run(["magick", "identify", "-format", "%wx%h", str(cropped)], capture_output=True, text=True,
                              check=True).stdout
        print(f"{name}.webp {size}")


if __name__ == "__main__":
    main()
