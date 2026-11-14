import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "loudscript.app";
const key = "634725a9c9b900381c755638742c9679";
const endpoint = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const files = args.filter((arg) => !arg.startsWith("--"));

if ((await readFile(path.join(root, `${key}.txt`), "utf8")).trim() !== key) {
  throw new Error(`${key}.txt must contain the IndexNow key`);
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const indexable = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url));

function urlForFile(file) {
  const route = file.replace(/^\.?\//, "").replace(/(^|\/)index\.html$/, "$1");
  return `https://${host}/${route}`;
}

const urlList = args.includes("--all")
  ? [...indexable]
  : [...new Set(files.map(urlForFile))].filter((url) => indexable.has(url));

if (!urlList.length) {
  console.log("IndexNow: no changed sitemap pages to submit.");
  process.exit(0);
}

const body = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList };
if (dryRun) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(body)
});
console.log(`IndexNow: HTTP ${response.status} for ${urlList.length} URLs`);
if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}
