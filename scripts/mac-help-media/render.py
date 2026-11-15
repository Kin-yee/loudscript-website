#!/usr/bin/env python3
"""Turn record.py's raw clip into the published MP4 and poster.

    python3 scripts/mac-help-media/render.py --raw /tmp/mac-help-raw --site .

Crops to the smaller Playback window so nothing behind the shrinking Settings
window shows, paints the rounded window corners white, and boxes each control
just before it is pressed. Click times come from the clip itself (the first
visual change inside each control), because screencapture starts recording a
variable delay after launch.
"""

import argparse
import json
import re
import subprocess
from pathlib import Path

HIGHLIGHT = "#6042f5"
SCALE = 2
LEAD_IN = 2.0
LEAD_BOX = 1.1
HOLD_AFTER = 1.6
CORNER_RADIUS = 30
PAD = 10


def change_times(clip: Path, box: tuple[int, int, int, int], threshold: float) -> list[float]:
    x, y, w, h = box
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(clip), "-vf",
         f"fps=60,crop={w}:{h}:{x}:{y},select='gt(scene,{threshold})',showinfo", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    return [float(t) for t in re.findall(r"pts_time:([0-9.]+)", log)]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw", type=Path, required=True)
    parser.add_argument("--site", type=Path, required=True)
    args = parser.parse_args()
    manifest = json.loads((args.raw / "ai-formatting-events.json").read_text())
    clip = args.raw / "ai-formatting-raw.mov"
    origin = manifest["rect"]
    width = int(manifest["final_rect"]["Width"]) * SCALE
    height = int(manifest["final_rect"]["Height"]) * SCALE

    boxes = []
    for event in manifest["events"]:
        f = event["frame"]
        x = int((f["x"] - origin["X"]) * SCALE) - PAD
        y = int((f["y"] - origin["Y"]) * SCALE) - PAD
        w = int(f["w"] * SCALE) + 2 * PAD
        h = int(f["h"] * SCALE) + 2 * PAD
        boxes.append((x, y, w, h))

    tab_click = change_times(clip, boxes[0], 0.01)[0]
    toggle_click = [t for t in change_times(clip, boxes[1], 0.01) if t > tab_click + 2.5][-1]
    start = max(0.0, tab_click - LEAD_IN)
    end = toggle_click + HOLD_AFTER
    windows = [(tab_click - LEAD_BOX, tab_click + 0.3), (toggle_click - LEAD_BOX, toggle_click + 0.8)]

    work = args.raw / "render"
    work.mkdir(exist_ok=True)
    subprocess.run(["magick", "-size", f"{width}x{height}", "xc:white", "(", "-size", f"{width}x{height}", "xc:white",
                    "-fill", "black", "-draw", f"roundrectangle 0,0,{width - 1},{height - 1},{CORNER_RADIUS},{CORNER_RADIUS}",
                    ")", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "PNG32:" + str(work / "corners.png")],
                   check=True)
    inputs = ["-i", str(work / "corners.png")]
    for i, (_, _, w, h) in enumerate(boxes):
        ring = work / f"ring{i}.png"
        subprocess.run(["magick", "-size", f"{w}x{h}", "xc:none", "-fill", "none", "-stroke", HIGHLIGHT,
                        "-strokewidth", "6", "-draw", f"roundrectangle 3,3,{w - 4},{h - 4},14,14", "PNG32:" + str(ring)], check=True)
        inputs += ["-i", str(ring)]

    graph = [f"[0:v]fps=30,crop={width}:{height}:0:0[base]", "[base][1:v]overlay=0:0[v0]"]
    for i, ((x, y, _, _), (a, b)) in enumerate(zip(boxes, windows)):
        graph.append(f"[v{i}][{i + 2}:v]overlay={x}:{y}:enable='between(t,{a:.2f},{b:.2f})'[v{i + 1}]")
    graph.append(f"[v{len(boxes)}]trim={start:.2f}:{end:.2f},setpts=PTS-STARTPTS,format=yuv420p[out]")

    out = args.site / "images" / "mac" / "help"
    out.mkdir(parents=True, exist_ok=True)
    video = out / "turn-on-ai-formatting.mp4"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(clip), *inputs, "-filter_complex", ";".join(graph),
                    "-map", "[out]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "24",
                    "-movflags", "+faststart", str(video)], check=True)
    poster = out / "turn-on-ai-formatting-poster.webp"
    still = work / "poster.png"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-sseof", "-0.1", "-i", str(video), "-frames:v", "1",
                    str(still)], check=True)
    subprocess.run(["cwebp", "-quiet", "-q", "85", str(still), "-o", str(poster)], check=True)
    print(json.dumps({"video": str(video), "poster": str(poster), "start": start, "end": end,
                      "tab_click": tab_click, "toggle_click": toggle_click, "size": [width, height]}))


if __name__ == "__main__":
    main()
