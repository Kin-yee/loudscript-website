import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const css = await readFile(new URL("css/styles.css", root), "utf8");
const mobileCss = css.split("/* Responsive — Mobile */")[1];
const landingFiles = ["templates/landing.html", "index.html",
  ...["de", "es", "fr", "ja", "nl", "zh-hans", "zh-hant"].map((locale) => `${locale}/index.html`)];

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  assert.ok(match, `Missing CSS rule: ${selector}`);
  return match[1];
}

test("mobile beta tooltip is anchored to the centered badge group, not its rightmost badge", () => {
  assert.match(mobileCss, /^\s*@media \(max-width: 600px\)\s*\{/);
  assert.match(rule(mobileCss, ".mac-hero-badges"), /position:\s*relative;/);
  assert.match(rule(mobileCss, ".mac-beta-badge"), /position:\s*static;/);
});

test("tooltip retains its viewport width bound and desktop positioning", () => {
  const note = rule(css, ".mac-beta-note");
  assert.match(note, /max-width:\s*min\(260px, calc\(100vw - 32px\)\);/);
  assert.match(note, /left:\s*50%;/);
  assert.match(note, /transform:\s*translateX\(-50%\);/);
  assert.match(rule(css, ".mac-beta-badge"), /position:\s*relative;/);
  assert.match(css, /\.mac-beta-badge:hover \.mac-beta-note,\s*\.mac-beta-badge:focus \.mac-beta-note\s*\{\s*visibility:\s*visible;/);
});

test("all landing pages keep the focusable beta badge and accessible translated note", async () => {
  for (const file of landingFiles) {
    const html = await readFile(new URL(file, root), "utf8");
    const group = html.match(/<div class="mac-hero-badges">([\s\S]*?)<\/div>/)?.[1];
    assert.ok(group, `${file}: missing badge group`);
    assert.match(group, /class="mac-beta-badge" tabindex="0" aria-describedby="beta-note"/);
    assert.match(group, /class="mac-beta-note" id="beta-note" role="tooltip">[^<]+<\/span>/);
  }
});
