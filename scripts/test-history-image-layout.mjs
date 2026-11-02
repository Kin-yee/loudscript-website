// Run with: node --test scripts/test-history-image-layout.mjs
// CSS/markup contract checks; use a cold-cache browser to verify actual layout.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const pages = ["templates/landing.html", "index.html", "zh-hant/index.html", "zh-hans/index.html", "de/index.html", "es/index.html", "fr/index.html", "ja/index.html", "nl/index.html"];

test("history figure reserves responsive width before its lazy image loads", async () => {
  const css = (await readFile(new URL("css/styles.css", root), "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
  const rule = css.match(/\.mac-screenshot-constrained\s*\{([^}]+)\}/)?.[1];
  assert.ok(rule, "history figure has a dedicated sizing rule");
  assert.match(rule, /(?:^|;)\s*width:\s*100%\s*;/, "explicit width prevents the unloaded flex item collapsing to zero");
  assert.match(rule, /(?:^|;)\s*max-width:\s*400px\s*;/, "preserve the desktop width cap");
  assert.match(rule, /(?:^|;)\s*margin:\s*0 auto\s*;/, "preserve centering");
});

test("history images retain intrinsic aspect ratio and lazy loading in every landing page", async () => {
  for (const page of pages) {
    const html = await readFile(new URL(page, root), "utf8");
    const figures = [...html.matchAll(/<figure class="mac-screenshot mac-screenshot-constrained">([\s\S]*?)<\/figure>/g)];
    assert.equal(figures.length, 1, `${page}: exactly one constrained history figure`);
    const image = figures[0][1].match(/<img\b[^>]*>/)?.[0];
    assert.ok(image, `${page}: history image exists`);
    assert.match(image, /src="\/images\/mac\/mac-history-overview.webp"/, `${page}: history screenshot`);
    assert.match(image, /\bwidth="760"/, `${page}: intrinsic width`);
    assert.match(image, /\bheight="1800"/, `${page}: intrinsic height reserves the aspect ratio`);
    assert.match(image, /\bloading="lazy"/, `${page}: do not eagerly fetch below-fold imagery`);
  }
});
