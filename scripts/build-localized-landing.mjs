import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { latestMacRelease, siteLastModified } from "./site-metadata.mjs";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(siteRoot, "templates", "landing.html");

const locales = [
  {
    id: "en",
    htmlLang: "en",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/",
    outputPath: path.join(siteRoot, "index.html"),
    ogLocale: "en_US",
    ogAlternateLocales: ["zh_TW", "zh_CN", "de_DE", "es_ES", "fr_FR", "ja_JP", "nl_NL"],
    guidePrefix: ""
  },
  {
    id: "zh-Hant",
    htmlLang: "zh-Hant",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/zh-hant/",
    outputPath: path.join(siteRoot, "zh-hant", "index.html"),
    ogLocale: "zh_TW",
    ogAlternateLocales: ["en_US", "zh_CN", "de_DE", "es_ES", "fr_FR", "ja_JP", "nl_NL"],
    guidePrefix: "/zh-hant"
  },
  {
    id: "zh-Hans",
    htmlLang: "zh-Hans",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/zh-hans/",
    outputPath: path.join(siteRoot, "zh-hans", "index.html"),
    ogLocale: "zh_CN",
    ogAlternateLocales: ["en_US", "zh_TW", "de_DE", "es_ES", "fr_FR", "ja_JP", "nl_NL"],
    guidePrefix: "/zh-hans"
  },
  {
    id: "de",
    htmlLang: "de",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/de/",
    outputPath: path.join(siteRoot, "de", "index.html"),
    ogLocale: "de_DE",
    ogAlternateLocales: ["en_US", "zh_TW", "zh_CN", "es_ES", "fr_FR", "ja_JP", "nl_NL"],
    guidePrefix: "/de"
  },
  {
    id: "es",
    htmlLang: "es",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/es/",
    outputPath: path.join(siteRoot, "es", "index.html"),
    ogLocale: "es_ES",
    ogAlternateLocales: ["en_US", "zh_TW", "zh_CN", "de_DE", "fr_FR", "ja_JP", "nl_NL"],
    guidePrefix: "/es"
  },
  {
    id: "fr",
    htmlLang: "fr",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/fr/",
    outputPath: path.join(siteRoot, "fr", "index.html"),
    ogLocale: "fr_FR",
    ogAlternateLocales: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "ja_JP", "nl_NL"],
    guidePrefix: "/fr"
  },
  {
    id: "ja",
    htmlLang: "ja",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/ja/",
    outputPath: path.join(siteRoot, "ja", "index.html"),
    ogLocale: "ja_JP",
    ogAlternateLocales: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "fr_FR", "nl_NL"],
    guidePrefix: "/ja"
  },
  {
    id: "nl",
    htmlLang: "nl",
    textDirection: "ltr",
    canonicalUrl: "https://loudscript.app/nl/",
    outputPath: path.join(siteRoot, "nl", "index.html"),
    ogLocale: "nl_NL",
    ogAlternateLocales: ["en_US", "zh_TW", "zh_CN", "de_DE", "es_ES", "fr_FR", "ja_JP"],
    guidePrefix: "/nl"
  }
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function languageNavigation(locale, messages) {
  const options = [
    { id: "en", href: "/", lang: "en", label: messages["nav.english"] },
    { id: "zh-Hant", href: "/zh-hant/", lang: "zh-Hant", label: messages["nav.chinese"] },
    { id: "zh-Hans", href: "/zh-hans/", lang: "zh-Hans", label: messages["nav.simplifiedChinese"] },
    { id: "de", href: "/de/", lang: "de", label: messages["nav.german"] },
    { id: "es", href: "/es/", lang: "es", label: messages["nav.spanish"] },
    { id: "fr", href: "/fr/", lang: "fr", label: messages["nav.french"] },
    { id: "ja", href: "/ja/", lang: "ja", label: messages["nav.japanese"] },
    { id: "nl", href: "/nl/", lang: "nl", label: messages["nav.dutch"] }
  ];
  const current = options.find((option) => option.id === locale.id);
  const links = options.map((option) => {
    const currentAttribute = option.id === locale.id ? ' aria-current="page"' : "";
    return [
      `        <a href="${option.href}" lang="${option.lang}" hreflang="${option.lang}"${currentAttribute}>`,
      `            <span>${escapeHtml(option.label)}</span>`,
      '            <svg class="mac-language-check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-7"/></svg>',
      "        </a>"
    ].join("\n");
  }).join("\n");

  return [
    `<nav class="mac-language-menu" aria-label="${escapeHtml(messages["nav.languageAria"])}">`,
    "    <details>",
    `        <summary aria-label="${escapeHtml(messages["nav.languageAria"])}: ${escapeHtml(current.label)}">`,
    '            <svg class="mac-language-globe" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M2.8 10h14.4M10 2.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5c-2-2.1-3-4.6-3-7.5s1-5.4 3-7.5Z"/></svg>',
    `            <span>${escapeHtml(current.label)}</span>`,
    '            <svg class="mac-language-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
    "        </summary>",
    '        <div class="mac-language-options">',
    links,
    "        </div>",
    "    </details>",
    "</nav>"
  ].join("\n");
}

function ogAlternateLocaleTags(locale) {
  return locale.ogAlternateLocales
    .map((alternate) => `<meta property="og:locale:alternate" content="${alternate}">`)
    .join("\n    ");
}

function englishFallbackBadge(locale, messages) {
  if (locale.id === "en") return "";
  return ` <small class="mac-link-language" aria-label="${escapeHtml(messages["fallback.englishPage"])}">EN</small>`;
}

function replaceAllLiteral(source, search, replacement) {
  return source.split(search).join(replacement);
}

const template = await readFile(templatePath, "utf8");
// GitHub Pages also serves the raw template. Keep that source out of search,
// and opt only the generated, fully rendered landing pages into indexing.
const templateRobots = '<meta name="robots" content="noindex, follow" data-build-only="robots">';
if (template.split(templateRobots).length !== 2) {
  throw new Error("Expected exactly one source-template noindex marker");
}
const englishMessages = JSON.parse(
  await readFile(path.join(siteRoot, "locales", "en.json"), "utf8")
);
// Built by scripts/build-voice-samples.mjs: the clips each page's reading-key
// demo can play, with the timing of every word.
const voiceSamples = JSON.parse(
  await readFile(path.join(siteRoot, "data", "voice-samples.json"), "utf8")
);

for (const locale of locales) {
  const messages = JSON.parse(
    await readFile(path.join(siteRoot, "locales", `${locale.id}.json`), "utf8")
  );

  const englishKeys = Object.keys(englishMessages).sort();
  const localeKeys = Object.keys(messages).sort();
  if (JSON.stringify(englishKeys) !== JSON.stringify(localeKeys)) {
    throw new Error(`${locale.id} locale keys do not match the English locale`);
  }

  let html = template
    .replace(templateRobots, '<meta name="robots" content="index, follow">')
    .replaceAll("{{htmlLang}}", locale.htmlLang)
    .replaceAll("{{textDirection}}", locale.textDirection)
    .replaceAll("{{canonicalUrl}}", locale.canonicalUrl)
    .replaceAll("{{selectedGuideUrl}}", `${locale.guidePrefix}/read-selected-text-aloud-mac/`)
    .replaceAll("{{ocrGuideUrl}}", `${locale.guidePrefix}/screenshot-ocr-text-to-speech-mac/`)
    .replaceAll("{{offlineGuideUrl}}", `${locale.guidePrefix}/offline-text-to-speech-mac/`)
    .replaceAll("{{pdfGuideUrl}}", `${locale.guidePrefix}/read-pdf-aloud-mac/`)
    .replaceAll("{{chooserGuideUrl}}", `${locale.guidePrefix}/best-text-to-speech-app-for-mac/`)
    .replaceAll("{{platformGuideUrl}}", "/loudscript-mac-vs-ios/")
    .replaceAll("{{iosAppStoreUrl}}", "https://apps.apple.com/app/loudscript-text-reader/id6747320736")
    .replaceAll("{{ogLocale}}", locale.ogLocale)
    .replaceAll("{{siteLastModified}}", siteLastModified)
    .replaceAll("{{latestMacVersion}}", latestMacRelease.version)
    .replaceAll("{{latestMacChangelogAnchor}}", latestMacRelease.changelogAnchor)
    .replaceAll("{{latestMacDownloadUrl}}", latestMacRelease.downloadUrl)
    .replace("{{{ogAlternateLocaleTags}}}", ogAlternateLocaleTags(locale))
    .replace("{{{languageNav}}}", languageNavigation(locale, messages))
    .replaceAll("{{{englishFallbackBadge}}}", englishFallbackBadge(locale, messages));

  const replacements = Object.keys(englishMessages)
    .filter((key) => !key.startsWith("nav.language"))
    .map((key) => ({ source: englishMessages[key], target: messages[key] }))
    .filter(({ source, target }) => source !== target)
    .sort((a, b) => b.source.length - a.source.length);

  for (const { source, target } of replacements) {
    html = replaceAllLiteral(html, source, target);
  }

  // The sample sentence goes in after the messages, so a translation can never rewrite part of it.
  const samples = voiceSamples[locale.id];
  html = html
    .replace("{{heroSampleLang}}", () => samples[0].lang)
    .replace("{{heroSampleText}}", () => escapeHtml(samples[0].text))
    .replace("{{{heroSamples}}}", () => JSON.stringify(samples).replaceAll("<", "\\u003c"));

  if (/\{\{{?[^{}]+}?\}\}/.test(html)) {
    throw new Error(`Unresolved template token in ${locale.id} output`);
  }

  await mkdir(path.dirname(locale.outputPath), { recursive: true });
  await writeFile(locale.outputPath, html, "utf8");
  console.log(`Built ${path.relative(siteRoot, locale.outputPath)}`);
}
