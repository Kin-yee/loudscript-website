import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guideSourcePattern, localizedGuideText } from "./build-localized-guides.mjs";
import { guideLastModified, latestMacRelease, siteLastModified } from "./site-metadata.mjs";
import { releasePages, renderReleasePage, releasedDisplayUS } from "./release-pages.mjs";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localeSpecs = [
  {
    id: "en",
    lang: "en",
    canonical: "https://loudscript.app/",
    output: "index.html",
    prefix: "",
    ogLocale: "en_US",
    primaryKeyword: "text-to-speech"
  },
  {
    id: "zh-Hant",
    lang: "zh-Hant",
    canonical: "https://loudscript.app/zh-hant/",
    output: "zh-hant/index.html",
    prefix: "zh-hant/",
    ogLocale: "zh_TW",
    primaryKeyword: "文字轉語音",
    openingKeyword: "文字轉語音"
  },
  {
    id: "zh-Hans",
    lang: "zh-Hans",
    canonical: "https://loudscript.app/zh-hans/",
    output: "zh-hans/index.html",
    prefix: "zh-hans/",
    ogLocale: "zh_CN",
    primaryKeyword: "文本转语音",
    openingKeyword: "文本转语音"
  },
  {
    id: "de",
    lang: "de",
    canonical: "https://loudscript.app/de/",
    output: "de/index.html",
    prefix: "de/",
    ogLocale: "de_DE",
    primaryKeyword: "Text auf dem Mac vorlesen",
    openingKeyword: "vorlesen"
  },
  {
    id: "es",
    lang: "es",
    canonical: "https://loudscript.app/es/",
    output: "es/index.html",
    prefix: "es/",
    ogLocale: "es_ES",
    primaryKeyword: "texto a voz para Mac",
    openingKeyword: "texto a voz"
  },
  {
    id: "fr",
    lang: "fr",
    canonical: "https://loudscript.app/fr/",
    output: "fr/index.html",
    prefix: "fr/",
    ogLocale: "fr_FR",
    primaryKeyword: "synthèse vocale pour Mac",
    openingKeyword: "synthèse vocale"
  },
  {
    id: "ja",
    lang: "ja",
    canonical: "https://loudscript.app/ja/",
    output: "ja/index.html",
    prefix: "ja/",
    ogLocale: "ja_JP",
    primaryKeyword: "テキスト読み上げ",
    openingKeyword: "テキスト読み上げ"
  },
  {
    id: "nl",
    lang: "nl",
    canonical: "https://loudscript.app/nl/",
    output: "nl/index.html",
    prefix: "nl/",
    ogLocale: "nl_NL",
    primaryKeyword: "tekst-naar-spraak voor Mac",
    openingKeyword: "tekst-naar-spraak"
  }
];
const guideRoutes = [
  { route: "read-selected-text-aloud-mac", schemaType: "HowTo", keywords: { en: "selected text", "zh-Hant": "朗讀", "zh-Hans": "朗读", de: "ausgewählten Text", es: "texto seleccionado", fr: "texte sélectionné", ja: "選択したテキスト", nl: "geselecteerde tekst" } },
  { route: "screenshot-ocr-text-to-speech-mac", schemaType: "HowTo", keywords: { en: "OCR", "zh-Hant": "OCR", "zh-Hans": "OCR", de: "OCR", es: "OCR", fr: "OCR", ja: "OCR", nl: "OCR" } },
  { route: "offline-text-to-speech-mac", schemaType: "TechArticle", keywords: { en: "Offline Text-to-Speech", "zh-Hant": "離線文字轉語音", "zh-Hans": "离线文本转语音", de: "Offline-Text-to-Speech", es: "texto a voz sin conexión", fr: "synthèse vocale hors ligne", ja: "オフライン音声読み上げ", nl: "offline tekst-naar-spraak" } },
  { route: "best-text-to-speech-app-for-mac", schemaType: "TechArticle", keywords: { en: "text-to-speech app", "zh-Hant": "文字轉語音 App", "zh-Hans": "文本转语音 App", de: "Text vorlesen", es: "texto a voz", fr: "synthèse vocale", ja: "読み上げアプリ", nl: "tekst-naar-spraak" } },
  { route: "read-pdf-aloud-mac", schemaType: "HowTo", keywords: { en: "PDF aloud", "zh-Hant": "朗讀 PDF", "zh-Hans": "朗读 PDF", de: "PDF vorlesen", es: "PDF en voz alta", fr: "PDF à voix haute", ja: "PDFを読み上げ", nl: "pdf voorlezen" } }
];
const firstPartySeoPages = [
  { route: "download", schemaType: "SoftwareApplication", titlePhrase: "Download LoudScript for Mac", lastModified: siteLastModified },
  { route: "speechify-alternative-mac", schemaType: "TechArticle", titlePhrase: "Speechify Alternative for Mac", lastModified: "2026-11-14" },
  { route: "elevenreader-mac", schemaType: "TechArticle", titlePhrase: "ElevenReader Mac App", lastModified: "2026-11-14" },
  { route: "loudscript-mac-vs-ios", schemaType: "TechArticle", titlePhrase: "LoudScript for Mac vs iPhone and iPad", lastModified: "2026-08-20" },
  { route: "kokoro-tts-mac", schemaType: "TechArticle", titlePhrase: "Kokoro TTS on Mac", lastModified: "2026-11-14" },
  { route: "text-to-audio-file-mac", schemaType: "HowTo", titlePhrase: "Save Text to Speech as an Audio File on Mac", lastModified: "2026-11-14" },
  { route: "help", schemaType: "TechArticle", titlePhrase: "LoudScript for Mac Help", lastModified: "2026-11-15" }
];
const voiceSamples = JSON.parse(await readFile(path.join(siteRoot, "data", "voice-samples.json"), "utf8"));
const allOgLocales = localeSpecs.map(({ ogLocale }) => ogLocale);

function assert(condition, message) {
  if (!condition) {
    const fix = /changelog|appcast/i.test(message)
      ? "Rerun the release lane to synchronize changelog.html, appcast.xml and data/latest-mac-release.json, then run npm test."
      : "Run npm run build, then npm test; if this persists, correct the source template or release record.";
    throw new Error(`${message}. ${fix}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function xmlTagValue(xml, tagName) {
  return xml.match(new RegExp(`<${escapeRegExp(tagName)}>([^<]+)</${escapeRegExp(tagName)}>`))?.[1];
}

function xmlAttributeValue(element, attributeName) {
  return element.match(new RegExp(`\\b${escapeRegExp(attributeName)}="([^"]+)"`))?.[1];
}

async function assertLocalTargetExists(url, outputPath) {
  if (url.startsWith("#")) {
    const html = await readFile(outputPath, "utf8");
    const id = url.slice(1);
    assert(new RegExp(`\\bid=["']${escapeRegExp(id)}["']`).test(html), `${outputPath}: missing #${id}`);
    return;
  }

  assert(url.startsWith("/"), `${outputPath}: local URL must be root-relative: ${url}`);
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  let target = path.join(siteRoot, pathname);
  if (pathname.endsWith("/")) target = path.join(target, "index.html");
  await access(target);
}

const template = await readFile(path.join(siteRoot, "templates", "landing.html"), "utf8");
const english = JSON.parse(await readFile(path.join(siteRoot, "locales", "en.json"), "utf8"));
const englishKeys = Object.keys(english).sort();
const localizedTitles = new Set();
const localizedDescriptions = new Set();
const changelog = await readFile(path.join(siteRoot, "changelog.html"), "utf8");
const releaseNotesUrl = `https://loudscript.app/changelog.html${latestMacRelease.changelogAnchor}`;
const releaseNotesId = latestMacRelease.changelogAnchor.slice(1);
const publicChangelog = changelog.split("<!-- PUBLIC_RELEASES_START -->")[1]
  ?.split("<!-- PUBLIC_RELEASES_END -->")[0]?.replace(/<!--[\s\S]*?-->/g, "") ?? "";
const firstChangelogEntry = publicChangelog.match(/<details class="release-entry"[^>]*>[\s\S]*?<\/details>/)?.[0];
assert(firstChangelogEntry?.includes(`id="${releaseNotesId}"`)
  && firstChangelogEntry.includes(`<span class="release-version">Version ${latestMacRelease.version}</span>`),
  `changelog.html first release is stale: expected ${latestMacRelease.version} from data/latest-mac-release.json`);
assert(siteLastModified >= latestMacRelease.released,
  "data/latest-mac-release.json siteLastModified predates the current release; run node scripts/set-latest-mac-release.mjs with the release arguments");
const currentChangelogEntry = changelog.match(
  new RegExp(`<details class="release-entry"[^>]*\\bid="${escapeRegExp(releaseNotesId)}"[\\s\\S]*?<\\/details>`)
)?.[0];

assert(
  currentChangelogEntry,
  "Changelog lacks the current release notes anchor"
);
assert(
  currentChangelogEntry.includes(`<time datetime="${latestMacRelease.released}">`),
  "Changelog current release date is stale"
);

const appcast = await readFile(path.join(siteRoot, "appcast.xml"), "utf8");
const latestAppcastItem = appcast.match(/<item>([\s\S]*?)<\/item>/)?.[1];
const appcastEnclosure = latestAppcastItem?.match(/<enclosure\b[^>]*\/>/)?.[0];
assert(latestAppcastItem, "Appcast lacks a release item");
const appcastPublishedAt = new Date(xmlTagValue(latestAppcastItem, "pubDate"));
assert(!Number.isNaN(appcastPublishedAt.valueOf()), "Appcast latest publication date is invalid");
assert(xmlTagValue(latestAppcastItem, "sparkle:shortVersionString") === latestMacRelease.version, "Appcast latest version is stale");
assert(xmlTagValue(latestAppcastItem, "sparkle:version") === latestMacRelease.build, "Appcast latest build is stale");
assert(appcastPublishedAt.toISOString().slice(0, 10) === latestMacRelease.released, "Appcast latest release date is stale");
assert(xmlAttributeValue(appcastEnclosure ?? "", "url") === latestMacRelease.downloadUrl, "Appcast latest asset URL is stale");
assert(xmlAttributeValue(appcastEnclosure ?? "", "length") === String(latestMacRelease.fileSizeBytes), "Appcast latest asset byte length is stale");

for (const page of releasePages) {
  assert(await readFile(path.join(siteRoot, page.output), "utf8") === await renderReleasePage(page),
    `${page.output}: stale generated release facts or content`);
}

for (const spec of localeSpecs) {
  const messages = JSON.parse(
    await readFile(path.join(siteRoot, "locales", `${spec.id}.json`), "utf8")
  );
  assert(
    JSON.stringify(Object.keys(messages).sort()) === JSON.stringify(englishKeys),
    `${spec.id}: locale key set differs from English`
  );
  for (const [key, value] of Object.entries(messages)) {
    assert(typeof value === "string" && value.trim(), `${spec.id}: empty translation for ${key}`);
  }
}

const generatedMessageKeys = new Set([
  "nav.languageAria",
  "nav.english",
  "nav.chinese",
  "nav.simplifiedChinese",
  "nav.german",
  "nav.spanish",
  "nav.french",
  "nav.japanese",
  "nav.dutch",
  "fallback.englishPage"
]);
for (const [key, value] of Object.entries(english)) {
  if (generatedMessageKeys.has(key) || key.endsWith(".answer")) continue;
  assert(template.includes(value), `Template does not use English message ${key}`);
}

for (const spec of localeSpecs) {
  const outputPath = path.join(siteRoot, spec.output);
  const html = await readFile(outputPath, "utf8");
  const messages = JSON.parse(
    await readFile(path.join(siteRoot, "locales", `${spec.id}.json`), "utf8")
  );

  assert(!/\{\{{?[^{}]+}?\}\}/.test(html), `${spec.output}: unresolved template token`);
  assert(html.includes(`<html lang="${spec.lang}" dir="ltr">`), `${spec.output}: incorrect html lang`);
  assert(html.includes(`<link rel="canonical" href="${spec.canonical}">`), `${spec.output}: incorrect canonical`);
  assert(html.includes(`<meta property="og:locale" content="${spec.ogLocale}">`), `${spec.output}: incorrect Open Graph locale`);
  for (const alternateOgLocale of allOgLocales.filter((value) => value !== spec.ogLocale)) {
    assert(html.includes(`<meta property="og:locale:alternate" content="${alternateOgLocale}">`), `${spec.output}: missing ${alternateOgLocale} Open Graph alternate`);
  }
  assert(html.includes(`<title>${messages["meta.title"]}</title>`), `${spec.output}: incorrect title`);
  assert((html.match(/<title>/g) || []).length === 1, `${spec.output}: expected exactly one title`);
  assert(
    html.includes(`<meta name="description" content="${messages["meta.description"]}">`),
    `${spec.output}: incorrect meta description`
  );
  assert((html.match(/<meta name="description"/g) || []).length === 1, `${spec.output}: expected exactly one meta description`);
  assert(html.includes('<meta name="robots" content="index, follow">'), `${spec.output}: page is not explicitly indexable`);
  assert(
    messages["meta.title"].toLocaleLowerCase().includes(spec.primaryKeyword.toLocaleLowerCase()),
    `${spec.output}: title lacks primary keyword`
  );
  if (spec.openingKeyword) {
    assert(messages["hero.intro"].includes(spec.openingKeyword), `${spec.output}: opening copy lacks primary keyword`);
  }
  assert(!localizedTitles.has(messages["meta.title"]), `${spec.output}: duplicate localized title`);
  assert(!localizedDescriptions.has(messages["meta.description"]), `${spec.output}: duplicate localized description`);
  localizedTitles.add(messages["meta.title"]);
  localizedDescriptions.add(messages["meta.description"]);
  assert((html.match(/<h1\b/g) || []).length === 1, `${spec.output}: expected exactly one h1`);
  if (["de", "es", "fr", "nl"].includes(spec.id)) {
    assert(messages["meta.title"].length <= 60, `${spec.output}: localized title is too long`);
    assert(messages["meta.description"].length >= 120 && messages["meta.description"].length <= 170, `${spec.output}: localized meta description is outside the reviewed range`);
  }
  if (spec.id === "ja") {
    assert(messages["meta.title"].length <= 35, `${spec.output}: Japanese title is too long`);
    assert(messages["meta.description"].length >= 60 && messages["meta.description"].length <= 120, `${spec.output}: Japanese meta description is outside the reviewed range`);
  }
  assert(
    html.includes(`<a href="/${spec.prefix}" lang="${spec.lang}" hreflang="${spec.lang}" aria-current="page">`),
    `${spec.output}: language navigation does not identify the current locale`
  );
  assert((html.match(/<nav class="mac-language-menu"/g) || []).length === 1, `${spec.output}: expected one language menu`);
  for (const guide of guideRoutes) {
    assert(html.includes(`href="/${spec.prefix}${guide.route}/" hreflang="${spec.lang}"`), `${spec.output}: guide link to ${guide.route} is not localized`);
    if (spec.prefix) assert(!html.includes(`href="/${guide.route}/"`), `${spec.output}: links to the English ${guide.route} instead of the localized guide`);
  }
  const languageMenu = html.match(/<nav class="mac-language-menu"[\s\S]*?<\/nav>/)?.[0];
  assert(languageMenu && (languageMenu.match(/<details>/g) || []).length === 1, `${spec.output}: language disclosure is missing`);
  assert((languageMenu.match(/hreflang=/g) || []).length === localeSpecs.length, `${spec.output}: language menu options are incomplete`);

  const alternates = [
    ['en', 'https://loudscript.app/'],
    ['zh-Hant', 'https://loudscript.app/zh-hant/'],
    ['zh-Hans', 'https://loudscript.app/zh-hans/'],
    ['de', 'https://loudscript.app/de/'],
    ['es', 'https://loudscript.app/es/'],
    ['fr', 'https://loudscript.app/fr/'],
    ['ja', 'https://loudscript.app/ja/'],
    ['nl', 'https://loudscript.app/nl/'],
    ['x-default', 'https://loudscript.app/']
  ];
  for (const [lang, href] of alternates) {
    assert(
      html.includes(`<link rel="alternate" hreflang="${lang}" href="${href}">`),
      `${spec.output}: missing ${lang} hreflang`
    );
  }

  const jsonLdMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert(jsonLdMatch, `${spec.output}: missing JSON-LD`);
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  const webPage = jsonLd["@graph"].find((entry) => entry["@type"] === "WebPage");
  const app = jsonLd["@graph"].find((entry) => entry["@type"] === "SoftwareApplication");
  assert(webPage?.url === spec.canonical && webPage?.inLanguage === spec.lang, `${spec.output}: invalid WebPage schema`);
  assert(
    app?.url === spec.canonical
      && app?.inLanguage === spec.lang
      && app?.name === messages["schema.appName"]
      && app?.description === messages["schema.appDescription"]
      && app?.operatingSystem === "macOS 15.6 or later"
      && app?.offers?.price === 0
      && app?.softwareVersion === latestMacRelease.version
      && app?.downloadUrl === latestMacRelease.downloadUrl
      && app?.installUrl === "https://loudscript.app/download/"
      && app?.releaseNotes === releaseNotesUrl
      && webPage?.dateModified === siteLastModified,
    `${spec.output}: invalid app schema`
  );
  assert(app.releaseNotes.endsWith(latestMacRelease.changelogAnchor), `${spec.output}: release notes anchor is stale`);
  assert(
    new RegExp(`\\bid=["']${escapeRegExp(new URL(app.releaseNotes).hash.slice(1))}["']`).test(changelog),
    `${spec.output}: release notes anchor does not resolve`
  );
  assert(!jsonLd["@graph"].some((entry) => entry["@type"] === "FAQPage"), `${spec.output}: obsolete FAQPage schema remains`);
  const faqList = html.match(/<div class="mac-faq-list">([\s\S]*?)<\/div>/)?.[1];
  assert(faqList && (faqList.match(/<details>/g) || []).length === 6, `${spec.output}: visible FAQ content is incomplete`);

  for (const labelledBy of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    assert(new RegExp(`\\bid=["']${escapeRegExp(labelledBy[1])}["']`).test(html), `${spec.output}: missing aria-labelledby target ${labelledBy[1]}`);
  }

  const embeddedSamples = html.match(/<script type="application\/json" class="ov-samples">([\s\S]*?)<\/script>/)?.[1];
  assert(embeddedSamples, `${spec.output}: reading-key samples are missing`);
  const samples = JSON.parse(embeddedSamples);
  assert(JSON.stringify(samples) === JSON.stringify(voiceSamples[spec.id]), `${spec.output}: reading-key samples differ from data/voice-samples.json`);
  for (const sample of samples) {
    await assertLocalTargetExists(sample.src, outputPath);
    let previous = { end: 0, to: 0 };
    for (const word of sample.words) {
      assert(
        word.start >= previous.end && word.end > word.start && word.from >= previous.to && word.to > word.from && word.to <= sample.text.length,
        `${spec.output}: ${sample.voice} sample has a word out of order at ${word.start}s`
      );
      previous = word;
    }
  }

  const localUrls = [];
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (!/^(?:https?:|mailto:|tel:)/.test(url)) localUrls.push(url);
  }
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) {
      localUrls.push(candidate.trim().split(/\s+/, 1)[0]);
    }
  }
  for (const url of new Set(localUrls)) {
    await assertLocalTargetExists(url, outputPath);
  }
}

for (const page of firstPartySeoPages) {
  const output = `${page.route}/index.html`;
  const outputPath = path.join(siteRoot, output);
  const canonical = `https://loudscript.app/${page.route}/`;
  const html = await readFile(outputPath, "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];

  assert(html.includes('<html lang="en">'), `${output}: incorrect html lang`);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `${output}: incorrect canonical`);
  assert(html.includes(`<meta property="og:url" content="${canonical}">`), `${output}: incorrect Open Graph URL`);
  assert(html.includes('<meta name="robots" content="index, follow">'), `${output}: page is not explicitly indexable`);
  assert(title?.toLocaleLowerCase().includes(page.titlePhrase.toLocaleLowerCase()), `${output}: title lacks target phrase`);
  assert(description && description.length >= 100 && description.length <= 180, `${output}: meta description is outside the reviewed range`);
  assert((html.match(/<h1\b/g) || []).length === 1, `${output}: expected exactly one h1`);

  const jsonLdMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert(jsonLdMatch, `${output}: missing JSON-LD`);
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  assert(Array.isArray(jsonLd["@graph"]), `${output}: JSON-LD graph is missing`);
  const mainEntity = jsonLd["@graph"].find((entry) => entry["@type"] === page.schemaType);
  assert(mainEntity, `${output}: ${page.schemaType} schema is missing`);
  if (page.schemaType === "SoftwareApplication") {
    const webPage = jsonLd["@graph"].find((entry) => entry["@type"] === "WebPage");
    assert(webPage?.dateModified === page.lastModified, `${output}: WebPage modification date is stale`);
    assert(mainEntity.softwareVersion === latestMacRelease.version, `${output}: release version is stale`);
    assert(mainEntity.downloadUrl === latestMacRelease.downloadUrl, `${output}: release URL is stale`);
    assert(mainEntity.fileSize === latestMacRelease.fileSizeDisplay, `${output}: release size is stale`);
    assert(mainEntity.datePublished === latestMacRelease.released, `${output}: release date is stale`);
    assert(mainEntity.releaseNotes === releaseNotesUrl, `${output}: release notes URL is stale`);
    assert(html.includes(latestMacRelease.sha256), `${output}: SHA-256 checksum is stale`);
    assert(html.includes(latestMacRelease.fileSizeBytes.toLocaleString("en-US")), `${output}: visible release size is stale`);
    assert(html.includes(`${latestMacRelease.version} (build ${latestMacRelease.build})`), `${output}: visible release details are stale`);
    assert(html.includes(latestMacRelease.releasedDisplay), `${output}: visible release date is stale`);
  } else {
    assert(mainEntity.mainEntityOfPage === canonical, `${output}: schema canonical is incorrect`);
    assert(mainEntity.dateModified === page.lastModified, `${output}: schema modification date is stale`);
  }

  for (const labelledBy of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
    assert(new RegExp(`\\bid=["']${escapeRegExp(labelledBy[1])}["']`).test(html), `${output}: missing aria-labelledby target ${labelledBy[1]}`);
  }
  const localUrls = [];
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (!/^(?:https?:|mailto:|tel:)/.test(url)) localUrls.push(url);
  }
  for (const url of new Set(localUrls)) await assertLocalTargetExists(url, outputPath);
}

const guideTitles = new Set();
const guideDescriptions = new Set();
for (const guide of guideRoutes) {
  const alternates = [
    ["en", `https://loudscript.app/${guide.route}/`],
    ["zh-Hant", `https://loudscript.app/zh-hant/${guide.route}/`],
    ["zh-Hans", `https://loudscript.app/zh-hans/${guide.route}/`],
    ["de", `https://loudscript.app/de/${guide.route}/`],
    ["es", `https://loudscript.app/es/${guide.route}/`],
    ["fr", `https://loudscript.app/fr/${guide.route}/`],
    ["ja", `https://loudscript.app/ja/${guide.route}/`],
    ["nl", `https://loudscript.app/nl/${guide.route}/`],
    ["x-default", `https://loudscript.app/${guide.route}/`]
  ];

  const englishGuide = await readFile(path.join(siteRoot, guide.route, "index.html"), "utf8");
  for (const locale of localeSpecs) {
    const prefix = locale.prefix;
    const output = `${prefix}${guide.route}/index.html`;
    const outputPath = path.join(siteRoot, output);
    const canonical = `https://loudscript.app/${prefix}${guide.route}/`;
    const html = await readFile(outputPath, "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
    const h1 = html.match(/<h1>([^<]+)<\/h1>/)?.[1];

    assert(html.includes(`<html lang="${locale.lang}">`), `${output}: incorrect html lang`);
    assert(html.includes(`<link rel="canonical" href="${canonical}">`), `${output}: incorrect canonical`);
    assert(html.includes(`<meta property="og:url" content="${canonical}">`), `${output}: incorrect Open Graph URL`);
    assert(html.includes(`<meta property="og:locale" content="${locale.ogLocale}">`), `${output}: incorrect Open Graph locale`);
    for (const alternateOgLocale of allOgLocales.filter((value) => value !== locale.ogLocale)) {
      assert(html.includes(`<meta property="og:locale:alternate" content="${alternateOgLocale}">`), `${output}: missing ${alternateOgLocale} Open Graph alternate`);
    }
    assert(html.includes('<meta name="robots" content="index, follow">'), `${output}: page is not explicitly indexable`);
    const keyword = guide.keywords[locale.id].toLocaleLowerCase();
    assert(title && title.toLocaleLowerCase().includes(keyword), `${output}: title lacks localized search phrase`);
    assert(h1 && h1.toLocaleLowerCase().includes(keyword), `${output}: h1 lacks localized search phrase`);
    assert(description && description.length >= 50, `${output}: meta description is missing or too short`);
    assert(description.toLocaleLowerCase().includes(keyword), `${output}: meta description lacks localized search phrase`);
    assert(html.includes(`<meta property="og:title" content="${title}">`), `${output}: Open Graph title differs from title`);
    const ogDescription = html.match(/<meta property="og:description" content="([^"]+)">/)?.[1];
    assert(ogDescription && ogDescription.length >= 15, `${output}: Open Graph description is missing or too short`);
    assert(html.includes(`<meta name="twitter:title" content="${title}">`), `${output}: Twitter title differs from title`);
    assert(!guideTitles.has(title), `${output}: duplicate guide title`);
    assert(!guideDescriptions.has(description), `${output}: duplicate guide description`);
    guideTitles.add(title);
    guideDescriptions.add(description);
    if (["de", "es", "fr", "nl"].includes(locale.id)) {
      assert(title.length <= 60, `${output}: localized title is too long`);
      assert(description.length >= 120 && description.length <= 170, `${output}: localized meta description is outside the reviewed range`);
    }
    if (locale.id === "ja") {
      assert(title.length <= 35, `${output}: Japanese title is too long`);
      assert(description.length >= 60 && description.length <= 120, `${output}: Japanese meta description is outside the reviewed range`);
    }

    for (const [lang, href] of alternates) {
      assert(html.includes(`<link rel="alternate" hreflang="${lang}" href="${href}">`), `${output}: missing ${lang} hreflang`);
    }
    assert(
      html.includes(`<a href="/${prefix}${guide.route}/" lang="${locale.lang}" hreflang="${locale.lang}" aria-current="page">`),
      `${output}: language navigation does not identify the current locale`
    );

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
    assert(jsonLdMatch, `${output}: missing JSON-LD`);
    const jsonLd = JSON.parse(jsonLdMatch[1]);
    const mainEntity = jsonLd["@graph"].find((entry) => entry["@type"] === guide.schemaType);
    const breadcrumb = jsonLd["@graph"].find((entry) => entry["@type"] === "BreadcrumbList");
    assert(mainEntity?.inLanguage === locale.lang, `${output}: schema language is incorrect`);
    assert(mainEntity?.mainEntityOfPage === canonical, `${output}: schema canonical is incorrect`);
    assert(mainEntity?.dateModified === guideLastModified[guide.route], `${output}: schema modification date is stale`);
    assert(breadcrumb?.itemListElement?.[0]?.item === `https://loudscript.app/${prefix}`, `${output}: breadcrumb home is not the ${locale.id} homepage`);
    assert(breadcrumb?.itemListElement?.[1]?.item === canonical, `${output}: breadcrumb canonical is incorrect`);

    if (locale.id !== "en") {
      const untranslated = [
        "Your speech text is not sent",
        "Speech synthesis stays on your Mac",
        "Optional AI formatting is a separate feature",
        "Updated August 19, 2026",
        ">Overview<",
        ">Guides<"
      ];
      for (const phrase of untranslated) assert(!html.includes(phrase), `${output}: untranslated English remains: ${phrase}`);
      for (const [source] of englishGuide.matchAll(guideSourcePattern)) {
        const target = localizedGuideText[locale.id][source];
        assert(html.includes(target), `${output}: translation of "${source}" is missing or was rewritten by another key. Expected "${target}"`);
      }
      if (locale.id === "de") {
        for (const phrase of ["How to ", "What if ", "Updated ", ">Read selected text<", ">Download DMG<"]) {
          assert(!html.includes(phrase), `${output}: untranslated English remains in German copy: ${phrase}`);
        }
      }
      if (locale.id === "es") {
        for (const phrase of ["How to ", "What if ", "Updated ", ">Read selected text<", ">Download DMG<"]) {
          assert(!html.includes(phrase), `${output}: untranslated English remains in Spanish copy: ${phrase}`);
        }
      }
      if (locale.id === "fr") {
        for (const phrase of ["How to ", "What if ", "Updated ", ">Read selected text<", ">Download DMG<"]) {
          assert(!html.includes(phrase), `${output}: untranslated English remains in French copy: ${phrase}`);
        }
      }
      if (locale.id === "ja") {
        for (const phrase of ["How to ", "What if ", "Updated ", ">Read selected text<", ">Download DMG<"]) {
          assert(!html.includes(phrase), `${output}: untranslated English remains in Japanese copy: ${phrase}`);
        }
      }
      if (locale.id === "nl") {
        for (const phrase of ["How to ", "What if ", "Updated ", ">Read selected text<", ">Download DMG<"]) {
          assert(!html.includes(phrase), `${output}: untranslated English remains in Dutch copy: ${phrase}`);
        }
      }
      const localePrefix = `/${locale.prefix}`;
      for (const related of guideRoutes) {
        if (englishGuide.includes(`href="/${related.route}/"`)) {
          assert(html.includes(`href="${localePrefix}${related.route}/"`), `${output}: missing localized link to ${related.route}`);
        }
        assert(!new RegExp(`href="/${related.route}/"(?! lang="en")`).test(html), `${output}: links to the English ${related.route} instead of the localized guide`);
      }
    }

    for (const labelledBy of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
      assert(new RegExp(`\\bid=["']${escapeRegExp(labelledBy[1])}["']`).test(html), `${output}: missing aria-labelledby target ${labelledBy[1]}`);
    }

    const localUrls = [];
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = match[1];
      if (!/^(?:https?:|mailto:|tel:)/.test(url)) localUrls.push(url);
    }
    for (const url of new Set(localUrls)) await assertLocalTargetExists(url, outputPath);
  }
}

const sitemap = await readFile(path.join(siteRoot, "sitemap.xml"), "utf8");
assert(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), "Sitemap lacks the XHTML namespace");
const sitemapAlternates = [
  ['en', 'https://loudscript.app/'],
  ['zh-Hant', 'https://loudscript.app/zh-hant/'],
  ['zh-Hans', 'https://loudscript.app/zh-hans/'],
  ['de', 'https://loudscript.app/de/'],
  ['es', 'https://loudscript.app/es/'],
  ['fr', 'https://loudscript.app/fr/'],
  ['ja', 'https://loudscript.app/ja/'],
  ['nl', 'https://loudscript.app/nl/'],
  ['x-default', 'https://loudscript.app/']
];
for (const spec of localeSpecs) {
  const escapedCanonical = escapeRegExp(spec.canonical);
  const blockMatch = sitemap.match(new RegExp(`<url>\\s*<loc>${escapedCanonical}<\\/loc>([\\s\\S]*?)<\\/url>`));
  assert(blockMatch, `Sitemap lacks ${spec.canonical}`);
  assert(blockMatch[1].includes(`<lastmod>${siteLastModified}</lastmod>`), `Sitemap block for ${spec.canonical} has a stale lastmod`);
  for (const [lang, href] of sitemapAlternates) {
    assert(
      blockMatch[1].includes(`hreflang="${lang}" href="${href}"`),
      `Sitemap block for ${spec.canonical} lacks ${lang} alternate`
    );
  }
}

for (const guide of guideRoutes) {
  const alternates = [
    ["en", `https://loudscript.app/${guide.route}/`],
    ["zh-Hant", `https://loudscript.app/zh-hant/${guide.route}/`],
    ["zh-Hans", `https://loudscript.app/zh-hans/${guide.route}/`],
    ["de", `https://loudscript.app/de/${guide.route}/`],
    ["es", `https://loudscript.app/es/${guide.route}/`],
    ["fr", `https://loudscript.app/fr/${guide.route}/`],
    ["ja", `https://loudscript.app/ja/${guide.route}/`],
    ["nl", `https://loudscript.app/nl/${guide.route}/`],
    ["x-default", `https://loudscript.app/${guide.route}/`]
  ];
  for (const [, canonical] of alternates.slice(0, 8)) {
    const blockMatch = sitemap.match(new RegExp(`<url>\\s*<loc>${escapeRegExp(canonical)}<\\/loc>([\\s\\S]*?)<\\/url>`));
    assert(blockMatch, `Sitemap lacks ${canonical}`);
    assert(blockMatch[1].includes(`<lastmod>${guideLastModified[guide.route]}</lastmod>`), `Sitemap block for ${canonical} has a stale lastmod`);
    for (const [lang, href] of alternates) {
      assert(blockMatch[1].includes(`hreflang="${lang}" href="${href}"`), `Sitemap block for ${canonical} lacks ${lang} alternate`);
    }
  }
}

const changelogBlock = sitemap.match(/<url>\s*<loc>https:\/\/loudscript\.app\/changelog\.html<\/loc>([\s\S]*?)<\/url>/);
// build-sitemap.mjs dates the changelog by its newest public release.
assert(changelogBlock?.[1].includes(`<lastmod>${latestMacRelease.released}</lastmod>`), "Sitemap changelog lastmod is stale");

const releaseEntries = [...changelog.matchAll(/<details class="release-entry"[^>]*>/g)].map((match) => match[0]);
const releaseYears = [...changelog.matchAll(/<time datetime="(\d{4})-\d{2}-\d{2}">/g)].map((match) => Number(match[1]));
const latestReleaseId = `version-${latestMacRelease.version.replaceAll(".", "-")}`;
assert(releaseEntries.length >= 3, "Changelog lacks the three latest timeline release entries");
assert(releaseEntries[0].includes(`id="${latestReleaseId}"`), "Changelog latest timeline entry is stale");
assert(releaseEntries.slice(0, 3).every((entry) => /\sopen(?:\s|>)/.test(entry)), "Changelog must open the three latest releases by default");
assert(releaseEntries.slice(3).every((entry) => !/\sopen(?:\s|>)/.test(entry)), "Changelog must collapse older releases by default");
assert(/<script defer src="\/js\/changelog\.js(\?v=[0-9a-f]+)?"><\/script>/.test(changelog), "Changelog lacks its deep-link behavior script");
const currentReleaseYear = releaseYears[0];
const currentYearReleaseCount = releaseYears.filter((year) => year === currentReleaseYear).length;
const currentYearReleaseLabel = currentYearReleaseCount === 1 ? "release" : "releases";
assert(
  changelog.includes(`<strong>${currentYearReleaseCount} ${currentYearReleaseLabel}</strong> in ${currentReleaseYear} so far.`),
  "Changelog current-year release count is stale"
);
await access(path.join(siteRoot, "js/changelog.js"));

for (const page of firstPartySeoPages) {
  const canonical = `https://loudscript.app/${page.route}/`;
  const blockMatch = sitemap.match(new RegExp(`<url>\\s*<loc>${escapeRegExp(canonical)}<\\/loc>([\\s\\S]*?)<\\/url>`));
  assert(blockMatch, `Sitemap lacks ${canonical}`);
  assert(blockMatch[1].includes(`<lastmod>${page.lastModified}</lastmod>`), `Sitemap block for ${canonical} has a stale lastmod`);
}

const llms = await readFile(path.join(siteRoot, "llms.txt"), "utf8");
assert(llms.includes(`LoudScript ${latestMacRelease.version} (build ${latestMacRelease.build})`), "llms.txt release facts are stale");
assert(llms.includes(`released ${releasedDisplayUS}.`), "llms.txt release date is stale");
assert(llms.includes(latestMacRelease.downloadUrl), "llms.txt download URL is stale");

const support = await readFile(path.join(siteRoot, "support.html"), "utf8");
const supportEmail = "hoyelam@kin-yee.com";
assert(
  support.includes(`<!--email_off--><a href="mailto:${supportEmail}">${supportEmail}</a><!--/email_off-->`),
  "Support email is not protected from Cloudflare email obfuscation"
);

console.log(`Validated ${localeSpecs.length} landing pages, ${guideRoutes.length * localeSpecs.length} localized guides, ${firstPartySeoPages.length} first-party SEO pages, and ${englishKeys.length} landing message keys.`);
