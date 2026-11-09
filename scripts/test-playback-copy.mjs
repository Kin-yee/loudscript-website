// Run with: node --test scripts/test-playback-copy.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const locales = ["en", "zh-Hant", "zh-Hans", "de", "es", "fr", "ja", "nl"];
const english = JSON.parse(await readFile(new URL("locales/en.json", root), "utf8"));
// 0.1.41 removed this unavailable Playback setting. Scope this guard to the
// feature instruction, not privacy warnings or historical release notes.
const removedSetting = /\b(?:AI|IA|KI)\b|AI整形/u;

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function playbackParagraph(html) {
  const section = html.match(/<section class="mac-detail mac-detail-reverse mac-reveal"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section, "voice and playback section exists");
  const paragraph = section.match(/<p>\s*([\s\S]*?)\s*<\/p>/)?.[1];
  assert.ok(paragraph, "voice and playback paragraph exists");
  return paragraph;
}

for (const locale of locales) {
  test(`${locale}: playback copy does not promote the removed AI setting`, async () => {
    const messages = JSON.parse(await readFile(new URL(`locales/${locale}.json`, root), "utf8"));
    assert.ok(messages["voice.body"].trim(), "localized playback copy is present");
    assert.doesNotMatch(messages["voice.body"], removedSetting);
    const page = locale === "en" ? "index.html" : `${locale.toLowerCase()}/index.html`;
    const html = await readFile(new URL(page, root), "utf8");
    assert.equal(playbackParagraph(html), escapeHtml(messages["voice.body"]));
    assert.doesNotMatch(playbackParagraph(html), removedSetting);
  });
}

test("landing source uses the corrected English playback message", async () => {
  const template = await readFile(new URL("templates/landing.html", root), "utf8");
  assert.equal(playbackParagraph(template), escapeHtml(english["voice.body"]));
  assert.doesNotMatch(playbackParagraph(template), removedSetting);
});
