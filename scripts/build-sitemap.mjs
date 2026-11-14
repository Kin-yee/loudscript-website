import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guideLastModified, siteLastModified } from "./site-metadata.mjs";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changelogLastModified = publicReleaseLastModified(
  await readFile(path.join(siteRoot, "changelog.html"), "utf8")
);

function publicReleaseLastModified(html) {
  const start = "<!-- PUBLIC_RELEASES_START -->";
  const end = "<!-- PUBLIC_RELEASES_END -->";
  const fail = (reason) => { throw new Error(`Invalid public changelog: ${reason}`); };
  if (html.split(start).length !== 2 || html.split(end).length !== 2
      || html.indexOf(start) > html.indexOf(end)) {
    fail("expected one ordered pair of PUBLIC_RELEASES markers");
  }
  // Match the site's release-entry details blocks, ignoring commented-out releases.
  const releases = html.slice(html.indexOf(start) + start.length, html.indexOf(end))
    .replace(/<!--[\s\S]*?-->/g, "");
  const entries = [...releases.matchAll(/<details\b[^>]*>[\s\S]*?<\/details\s*>/gi)]
    .map(([entry]) => entry)
    .filter((entry) => /<details\b[^>]*\sclass\s*=\s*(["'])[^"']*\brelease-entry\b[^"']*\1/i.test(entry));
  if (!entries.length) fail("no public release entries");
  const dates = entries.map((entry) => {
    const times = [...entry.matchAll(/<time\b[^>]*>/gi)];
    const date = times.length === 1
      ? times[0][0].match(/\sdatetime\s*=\s*(["'])(.*?)\1/i)?.[2] : undefined;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail("missing or invalid release date");
    const [year, month, day] = date.split("-").map(Number);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) {
      fail(`invalid release date ${date}`);
    }
    return date;
  });
  return dates.sort().at(-1);
}

const siteUrl = "https://loudscript.app";
const locales = [
  { lang: "en", prefix: "" },
  { lang: "zh-Hant", prefix: "/zh-hant" },
  { lang: "zh-Hans", prefix: "/zh-hans" },
  { lang: "de", prefix: "/de" },
  { lang: "es", prefix: "/es" },
  { lang: "fr", prefix: "/fr" },
  { lang: "ja", prefix: "/ja" },
  { lang: "nl", prefix: "/nl" }
];
const routes = [
  { route: "", lastModified: siteLastModified },
  ...Object.entries(guideLastModified).map(([route, lastModified]) => ({ route, lastModified }))
];
const staticPages = [
  { route: "download/", lastModified: siteLastModified },
  { route: "best-text-to-speech-app-for-mac/", lastModified: "2026-11-14" },
  { route: "speechify-alternative-mac/", lastModified: "2026-11-14" },
  { route: "elevenreader-mac/", lastModified: "2026-11-14" },
  { route: "read-pdf-aloud-mac/", lastModified: "2026-08-20" },
  { route: "loudscript-mac-vs-ios/", lastModified: "2026-08-20" },
  { route: "privacy.html", lastModified: "2026-05-21" },
  { route: "tos.html", lastModified: "2026-05-21" },
  { route: "support.html", lastModified: "2026-11-14" },
  { route: "changelog.html", lastModified: changelogLastModified }
];

function localizedUrl(prefix, route) {
  return `${siteUrl}${prefix}/${route ? `${route}/` : ""}`;
}

function alternateLines(route) {
  const lines = locales.map(({ lang, prefix }) =>
    `    <xhtml:link rel="alternate" hreflang="${lang}" href="${localizedUrl(prefix, route)}" />`
  );
  lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl("", route)}" />`);
  return lines.join("\n");
}

const localizedBlocks = routes.flatMap(({ route, lastModified }) =>
  locales.map(({ prefix }) => [
    "  <url>",
    `    <loc>${localizedUrl(prefix, route)}</loc>`,
    `    <lastmod>${lastModified}</lastmod>`,
    alternateLines(route),
    "  </url>"
  ].join("\n"))
);

const staticBlocks = staticPages.map(({ route, lastModified: pageLastModified }) => [
  "  <url>",
  `    <loc>${siteUrl}/${route}</loc>`,
  `    <lastmod>${pageLastModified}</lastmod>`,
  "  </url>"
].join("\n"));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...localizedBlocks,
  ...staticBlocks,
  "</urlset>",
  ""
].join("\n");

await writeFile(path.join(siteRoot, "sitemap.xml"), sitemap, "utf8");
console.log(`Built sitemap.xml with ${localizedBlocks.length + staticBlocks.length} URLs`);
