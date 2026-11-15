#!/usr/bin/env python3
"""Record the "turn on AI formatting" clip for /help/.

Same setup as capture.py. Records only the Settings window's screen rect while
Accessibility actions switch to Playback, scroll, and flip the toggle, then
draws a highlight box over each control as it is pressed.

    python3 scripts/mac-help-media/record.py --out /tmp/mac-help-raw
"""

import argparse
import json
import subprocess
import time
from pathlib import Path

from capture import open_settings, osascript, pid_of, set_checkbox, settings_tab, windows_of

TOGGLE = "Use AI Formatting Before Speaking"


def frame_of(process: str, role: str, name: str) -> dict:
    out = osascript(process, f"""
set candidates to entire contents of front window
repeat with candidate in candidates
    try
        if role of candidate is "{role}" and (name of candidate as text) is "{name}" then
            set p to position of candidate
            set s to size of candidate
            return (item 1 of p as text) & "," & (item 2 of p as text) & "," & (item 1 of s as text) & "," & (item 2 of s as text)
        end if
    end try
end repeat
error "{role} {name} not found\"""")
    x, y, w, h = (float(v) for v in out.split(","))
    return {"x": x, "y": y, "w": w, "h": h}


def smooth_scroll(process: str, steps: int = 40) -> None:
    osascript(process, f"""
set bar to scroll bar 1 of scroll area 1 of group 1 of front window
repeat with i from 1 to {steps}
    set value of bar to 1 - ((1 - i / {steps}) ^ 3)
    delay 0.012
end repeat""")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--process", default="LoudScriptVerifyHelp")
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    process, pid = args.process, pid_of(args.process)

    open_settings(process)
    settings_tab(process, "Playback")
    set_checkbox(process, TOGGLE, False)
    settings_tab(process, "General")
    osascript(process, 'set frontmost to true\nperform action "AXRaise" of window "General"')
    time.sleep(0.8)
    window = next(w for w in windows_of(pid) if w["name"] == "General" and w["layer"] == 0)["bounds"]
    rect = f"{int(window['X'])},{int(window['Y'])},{int(window['Width'])},{int(window['Height'])}"

    raw = args.out / "ai-formatting-raw.mov"
    raw.unlink(missing_ok=True)
    duration = 10
    recorder = subprocess.Popen(["screencapture", "-x", "-v", f"-V{duration}", f"-R{rect}", str(raw)])
    start = time.monotonic()
    events = []

    def at(seconds: float) -> None:
        time.sleep(max(0.0, seconds - (time.monotonic() - start)))

    at(2.6)
    tab = frame_of(process, "AXButton", "Playback")
    events.append({"t": time.monotonic() - start, "frame": tab})
    settings_tab(process, "Playback")
    at(4.2)
    smooth_scroll(process)
    at(5.8)
    toggle = frame_of(process, "AXCheckBox", TOGGLE)
    events.append({"t": time.monotonic() - start, "frame": toggle})
    set_checkbox(process, TOGGLE, True)
    recorder.wait()
    final = next(w for w in windows_of(pid) if w["name"] == "Playback" and w["layer"] == 0)["bounds"]

    manifest = {"rect": window, "final_rect": final, "events": events, "duration": duration}
    (args.out / "ai-formatting-events.json").write_text(json.dumps(manifest, indent=2))
    print(raw)
    print(json.dumps(manifest))


if __name__ == "__main__":
    main()
