import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const css = await readFile(new URL("css/styles.css", root), "utf8");

// Guard the fail-open CSS contract without adding a browser dependency. Browser
// verification should also disable JavaScript and simulate an observer failure.
test("reveal content is visible before JavaScript or an observer callback", () => {
  const base = css.match(/(?:^|\n)\.mac-reveal\s*\{([^}]+)\}/)?.[1];
  assert(base, "Missing base reveal rule");
  assert.match(base, /opacity:\s*1\s*;/);
  assert.match(base, /transform:\s*none\s*;/);
  assert.doesNotMatch(base, /(?:visibility:\s*hidden|display:\s*none|animation:)/);
});

test("intersection adds a finite animation instead of unlocking hidden content", () => {
  const revealed = css.match(/\.mac-reveal\.mac-visible\s*\{([^}]+)\}/)?.[1];
  assert(revealed, "Missing observer-triggered animation rule");
  assert.match(revealed, /animation:\s*mac-reveal-in\s+0\.7s\s+ease\s+backwards\s*;/);
  assert.doesNotMatch(revealed, /infinite|opacity:\s*0/);
  assert.match(css, /@keyframes mac-reveal-in\s*\{\s*from\s*\{\s*opacity:\s*0;/);
  assert.match(css, /to\s*\{\s*opacity:\s*1;\s*transform:\s*none;/);
});

test("reduced motion disables the animation with matching specificity", () => {
  const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reduced, /\.mac-reveal,\s*\.mac-reveal\.mac-visible\s*\{[^}]*animation:\s*none\s*;/);
});

test("all generated landing pages use the shared visibility rules", async () => {
  for (const locale of ["", "de/", "es/", "fr/", "ja/", "nl/", "zh-hans/", "zh-hant/"]) {
    const html = await readFile(new URL(`${locale}index.html`, root), "utf8");
    assert.match(html, /<link rel="stylesheet" href="\/css\/styles\.css">/, locale || "en");
    assert.match(html, /class="[^"]*mac-reveal/);
    assert.match(html, /entry\.target\.classList\.add\('mac-visible'\)/);
  }
});
