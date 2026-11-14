import { readFileSync } from "node:fs";

const record = JSON.parse(readFileSync(new URL("../data/latest-mac-release.json", import.meta.url), "utf8"));

export const siteLastModified = record.siteLastModified;
export const guideLastModified = Object.freeze({
  "read-selected-text-aloud-mac": "2026-08-20",
  "screenshot-ocr-text-to-speech-mac": "2026-11-14",
  "offline-text-to-speech-mac": "2026-11-14",
  "best-text-to-speech-app-for-mac": "2026-11-14",
  "read-pdf-aloud-mac": "2026-11-14"
});
export const latestMacRelease = Object.freeze(record.latestMacRelease);
