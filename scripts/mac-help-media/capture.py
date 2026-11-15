#!/usr/bin/env python3
"""Capture the LoudScript for Mac screenshots used by /help/.

Run it from the website repo against an isolated app built by the Mac repo's
verify-loudscript-macos harness, so captures never touch real LoudScript data.
Take the UI lock other agents use (mkdir /tmp/loudscript-mac-ui.lock) first.

    V=<mac repo>/.agents/skills/verify-loudscript-macos/scripts/verify.py
    D=com.kin-yee.LoudScript-mac.verification.help
    $V --instance help setup
    defaults write $D application.appearance -string light
    defaults write $D AppleLocale en_US
    defaults write $D AppleShowScrollBars -string WhenScrolling
    $V --instance help launch
    python3 scripts/mac-help-media/capture.py --pass fresh --out /tmp/mac-help-raw
    $V --instance help stop
    $V --instance help perf seed --model phonon
    $V --instance help perf seed --model supertonic
    defaults write $D speechFormatting.isEnabled -bool true
    $V --instance help launch
    python3 scripts/mac-help-media/capture.py --pass seeded --out /tmp/mac-help-raw
    python3 scripts/mac-help-media/record.py --out /tmp/mac-help-raw
    python3 scripts/mac-help-media/render.py --raw /tmp/mac-help-raw --site .
    python3 scripts/mac-help-media/stills.py --raw /tmp/mac-help-raw --site .
    $V --instance help cleanup --confirm

The seeded pass sends the sample text to the live AI formatting API and plays
under a second of speech. Everything is driven through Accessibility actions on
the app's own windows, never synthetic mouse moves, and captured by window ID.
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
WINDOW_LISTER = Path("/tmp/mac-help-windows")


def osascript(process: str, body: str) -> str:
    script = f'tell application "System Events" to tell process "{process}"\n{body}\nend tell'
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"osascript failed: {result.stderr.strip()}\n{body}")
    return result.stdout.strip()


def pid_of(process: str) -> int:
    return int(subprocess.run(["pgrep", "-x", process], capture_output=True, text=True, check=True).stdout.split()[0])


def window_id(pid: int, name: str) -> int:
    for _ in range(50):
        windows = windows_of(pid)
        match = [w for w in windows if w["name"] == name and w["layer"] == 0]
        if match:
            return match[0]["id"]
        time.sleep(0.1)
    sys.exit(f"no on-screen window named {name!r}: {[w['name'] for w in windows]}")


# Each flaw is one only AI formatting fixes. LoudScript already joins words split
# across lines on its own, so a hyphenated sample would not show a difference.
SAMPLE_TEXT = "The report was was published in March.[1] It recieved wide attention from readers Most of them read it on their phones."


def windows_of(pid: int) -> list[dict]:
    if not WINDOW_LISTER.exists():
        subprocess.run(["swiftc", "-O", str(HERE / "windows.swift"), "-o", str(WINDOW_LISTER)], check=True)
    return json.loads(subprocess.run([str(WINDOW_LISTER), str(pid)], capture_output=True, text=True, check=True).stdout)


def capture_with_menu(pid: int, path: Path) -> None:
    """Capture an open pop-up menu's window. macOS includes the parent window
    under it and nothing from other apps."""
    for _ in range(50):
        menus = [w for w in windows_of(pid) if w["layer"] > 0 and w["name"] == ""]
        if menus:
            break
        time.sleep(0.1)
    else:
        sys.exit("no pop-up menu window appeared")
    time.sleep(0.4)
    subprocess.run(["screencapture", "-o", "-x", f"-l{menus[0]['id']}", str(path)], check=True)
    print(path)


def set_composer_text(process: str, text: str) -> None:
    osascript(process, f"""
set candidates to entire contents of window "LoudScript"
repeat with candidate in candidates
    try
        if (value of attribute "AXIdentifier" of candidate as text) is "main-composer-editor" then
            set value of candidate to "{text}"
            return
        end if
    end try
end repeat
error "composer not found"
""")


def ax_press(process: str, condition: str, window: str = "LoudScript") -> None:
    """AXPress the first element of the window for which the AppleScript
    condition on `candidate` holds."""
    osascript(process, f"""
set frontmost to true
set candidates to entire contents of window "{window}"
repeat with candidate in candidates
    try
        if {condition} then
            perform action "AXPress" of candidate
            return
        end if
    end try
end repeat
error "no matching element"
""")


def press(process: str, role: str, name: str, window: str = "LoudScript") -> None:
    ax_press(process, f'role of candidate is "{role}" and (name of candidate as text) is "{name}"', window)


def press_id(process: str, identifier: str) -> None:
    ax_press(process, f'(value of attribute "AXIdentifier" of candidate as text) is "{identifier}"')


def wait_for_description(process: str, description: str) -> None:
    osascript(process, f"""
repeat 150 times
    set candidates to entire contents of window "LoudScript"
    repeat with candidate in candidates
        try
            if (description of candidate as text) is "{description}" then return
        end try
    end repeat
    delay 0.1
end repeat
error "{description} never appeared"
""")


def dismiss_menu(process: str) -> None:
    osascript(process, "if frontmost then key code 53")


def capture(pid: int, window: str, path: Path) -> None:
    time.sleep(0.6)
    subprocess.run(["screencapture", "-o", "-x", f"-l{window_id(pid, window)}", str(path)], check=True)
    print(path)


def open_settings(process: str) -> None:
    osascript(process, """
set frontmost to true
if not (exists window "General") then
    repeat with candidate in menu items of menu 1 of menu bar item 2 of menu bar 1
        try
            if (value of attribute "AXMenuItemCmdChar" of candidate as text) is "," then click candidate
        end try
    end repeat
end if
repeat 50 times
    if exists toolbar 1 of front window then exit repeat
    delay 0.1
end repeat""")


def settings_tab(process: str, tab: str) -> None:
    osascript(process, f"""
set frontmost to true
click button "{tab}" of toolbar 1 of front window
repeat 50 times
    if title of front window is "{tab}" then exit repeat
    delay 0.1
end repeat""")


def set_checkbox(process: str, label: str, on: bool) -> None:
    osascript(process, f"""
set found to missing value
set candidates to entire contents of front window
repeat with candidate in candidates
    try
        if role of candidate is "AXCheckBox" and (name of candidate as text) is "{label}" then
            set found to candidate
            exit repeat
        end if
    end try
end repeat
if found is missing value then error "checkbox not found: {label}"
if ((value of found) as integer) is not {1 if on else 0} then click found""")


def shot_settings(process: str, pid: int, out: Path, tab: str, name: str) -> None:
    open_settings(process)
    settings_tab(process, tab)
    capture(pid, tab, out / f"{name}.png")


def shot_model_menu(process: str, pid: int, out: Path) -> None:
    set_composer_text(process, SAMPLE_TEXT)
    press(process, "AXMenuButton", "Speech Model")
    capture_with_menu(pid, out / "main-model-menu.png")
    dismiss_menu(process)


def shot_formatted(process: str, pid: int, out: Path) -> None:
    """Needs AI formatting on and SAMPLE_TEXT in the composer. Stops playback as
    soon as the formatted read exists."""
    press_id(process, "main-playback-button")
    wait_for_description(process, "Formatted")
    press_id(process, "main-stop-button")
    ax_press(process, '(description of candidate as text) is "Hide Overview"')
    capture(pid, "LoudScript", out / "main-formatted.png")
    ax_press(process, 'role of candidate is "AXRadioButton" and (description of candidate as text) is "Original"')
    capture(pid, "LoudScript", out / "main-original.png")


def shot_model_remove_menu(process: str, pid: int, out: Path) -> None:
    open_settings(process)
    settings_tab(process, "Models")
    press(process, "AXMenuButton", "More actions for Supertonic", window="Models")
    capture_with_menu(pid, out / "settings-models-remove.png")
    dismiss_menu(process)


PASSES = {
    "fresh": [lambda *a, tab=tab, name=name: shot_settings(*a, tab, name) for tab, name in [
        ("General", "settings-general"), ("Models", "settings-models"), ("Shortcuts", "settings-shortcuts"),
        ("Permissions", "settings-permissions"), ("Playback", "settings-playback")]],
    "seeded": [shot_model_menu, shot_formatted, shot_model_remove_menu],
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--process", default="LoudScriptVerifyHelp")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--pass", dest="phase", choices=PASSES, required=True,
                        help="fresh: before any model is installed. seeded: after seeding Supertonic and Phonon.")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    for shot in PASSES[args.phase]:
        shot(args.process, pid_of(args.process), args.out)


if __name__ == "__main__":
    main()
