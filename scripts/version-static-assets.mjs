import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Cloudflare caches /css and /js for hours but HTML for minutes, so a returning
// browser can pair new markup with an old stylesheet. A content hash in each
// reference makes every deploy fetch the files its markup was written against.
const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetReference = /(["'])\/?((?:css|js)\/[\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]*)?\1/g;
const skippedDirectories = new Set([".git", "node_modules"]);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return skippedDirectories.has(entry.name) ? [] : htmlFiles(entryPath);
    return entry.name.endsWith(".html") ? [entryPath] : [];
  }));
  return nested.flat();
}

const hashes = new Map();
async function assetHash(assetPath) {
  if (!hashes.has(assetPath)) {
    const contents = await readFile(path.join(siteRoot, assetPath));
    hashes.set(assetPath, createHash("sha256").update(contents).digest("hex").slice(0, 10));
  }
  return hashes.get(assetPath);
}

async function versioned(html) {
  const references = [...html.matchAll(assetReference)];
  const versions = await Promise.all(references.map(([, , assetPath]) => assetHash(assetPath)));
  let index = 0;
  return html.replace(assetReference, (_, quote, assetPath) => `${quote}/${assetPath}?v=${versions[index++]}${quote}`);
}

const checkOnly = process.argv.includes("--check");
const stale = [];
for (const file of await htmlFiles(siteRoot)) {
  const html = await readFile(file, "utf8");
  const updated = await versioned(html);
  if (updated === html) continue;
  if (checkOnly) stale.push(path.relative(siteRoot, file));
  else await writeFile(file, updated);
}

if (stale.length > 0) {
  console.error(`Stale /css or /js references; run npm run build:\n${stale.join("\n")}`);
  process.exit(1);
}
