// Stages real LoudScript for Mac captures into the home page card images.
//
//   node scripts/home-media/render-scenes.mjs --raw <dir> [--only audience-proofread,guide-ocr]
//
// <dir> holds stills-light/ and stills-dark/: 2304x1440 Retina window captures
// of the same seeded history in each appearance, plus overlay-alpha.png (the
// floating player, 840x486 with alpha) and model-menu-composite.png (the main
// window with its speech model menu open, 2304x1548). Crops are in points.
// Scenes are laid out on a 1000x625 stage, rendered by headless Chrome at twice
// the card width, and encoded with cwebp. Needs Google Chrome, magick and cwebp.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const { values: args } = parseArgs({ options: { raw: { type: "string" }, only: { type: "string" } } });
if (!args.raw) throw new Error("--raw <dir with stills-light/ and stills-dark/> is required");

const audience = { width: 600 };
const guide = { width: 480 };
const windowWidth = 1152;

// kind: "window" keeps the macOS window corners, "panel" is a crop through the
// UI, "callout" is a crop lifted in front with a card ring, and "lift" is a
// crop of something that has its own shape (a menu, the floating player),
// clipped to its corner radius and shadowed without a ring.
const scenes = [
  {
    name: "audience-proofread", ...audience, theme: "dark",
    layers: [
      { kind: "panel", still: "proofread-playing", crop: [250, 128, 670, 592], at: [60, 30, 640] },
      { kind: "callout", still: "proofread-playing", crop: [1036, 172, 104, 82], at: [600, 347, 150] },
    ],
  },
  {
    name: "audience-study", ...audience, theme: "light",
    layers: [
      { kind: "panel", still: "pdf-playing", crop: [270, 140, 418, 442], at: [70, 60, 470] },
      { kind: "callout", still: "pdf-playing", crop: [710, 170, 384, 420], at: [500, 110, 440] },
    ],
  },
  {
    name: "audience-ocr", ...audience, theme: "light",
    layers: [
      { kind: "panel", still: "tomato-overview", crop: [250, 60, 900, 420], at: [60, 90, 820] },
      { kind: "callout", still: "tomato-overview", crop: [940, 400, 200, 132], at: [600, 330, 340] },
    ],
  },
  {
    name: "audience-floating", ...audience, theme: "dark",
    layers: [
      { kind: "lift", still: "overlay-alpha", stillWidth: 420, crop: [0, 0, 420, 243], radius: 0, at: [170, 115, 660] },
    ],
  },
  {
    name: "guide-selected-text", ...guide, theme: "dark",
    layers: [
      { kind: "panel", still: "trees-overview", crop: [250, 60, 900, 402], at: [60, 90, 820] },
      { kind: "callout", still: "trees-overview", crop: [940, 264, 200, 108], at: [600, 360, 340] },
    ],
  },
  {
    name: "guide-ocr", ...guide, theme: "light",
    layers: [
      { kind: "panel", still: "tidal-overview", crop: [250, 60, 900, 420], at: [60, 90, 820] },
      { kind: "callout", still: "tidal-overview", crop: [940, 400, 200, 132], at: [600, 340, 340] },
    ],
  },
  {
    name: "guide-offline-voices", ...guide, theme: "dark",
    layers: [
      { kind: "panel", still: "model-menu-composite", crop: [236, 560, 684, 160], at: [30, 160, 940] },
      { kind: "lift", still: "model-menu-composite", crop: [691, 609, 175, 165], radius: 9, at: [610, 215, 290] },
    ],
  },
  {
    name: "guide-pdf", ...guide, theme: "light",
    layers: [
      { kind: "panel", still: "pdf-playing", crop: [700, 145, 400, 450], at: [70, 40, 480] },
      { kind: "callout", still: "pdf-playing", crop: [8, 458, 214, 80], at: [520, 240, 420] },
    ],
  },
  {
    name: "guide-chooser", ...guide, theme: "dark",
    layers: [
      { kind: "window", still: "lecture-playing", crop: [0, 0, 1152, 720], at: [90, 70, 820], tilt: true },
    ],
  },
  {
    name: "guide-audio-file", ...guide, theme: "light",
    layers: [
      { kind: "panel", still: "export-main", crop: [250, 272, 680, 428], at: [70, 80, 860] },
    ],
  },
  {
    name: "guide-kokoro", ...guide, theme: "dark",
    layers: [
      { kind: "panel", still: "kokoro-trees-playing", crop: [250, 395, 670, 325], at: [60, 100, 880] },
    ],
  },
  {
    name: "guide-speechify", ...guide, theme: "light",
    layers: [
      { kind: "window", still: "trees-playing", crop: [0, 0, 1152, 720], at: [90, 70, 820], tilt: true },
    ],
  },
  {
    name: "guide-elevenreader", ...guide, theme: "dark",
    layers: [
      { kind: "window", still: "trees-focus-playing", crop: [0, 0, 1152, 720], at: [70, 44, 860] },
    ],
  },
];

const stage = { width: 1000, height: 625 };

function stillPath(layer, theme) {
  return path.resolve(args.raw, `stills-${theme}`, `${layer.still}.png`);
}

function layerHtml(layer, theme) {
  const [left, top, width] = layer.at;
  const [x, y, w, h] = layer.crop;
  const scale = width / w;
  const radius = layer.kind === "window" ? 13 : layer.radius;
  const classes = ["layer", layer.kind, layer.tilt ? "tilt" : ""].join(" ");
  const style = `left:${left}px;top:${top}px;width:${width}px;height:${h * scale}px${radius === undefined ? "" : `;border-radius:${radius * scale}px`}`;
  const image = `width:${(layer.stillWidth ?? windowWidth) * scale}px;left:${-x * scale}px;top:${-y * scale}px`;
  return `<div class="${classes}" style="${style}"><img src="${pathToFileURL(stillPath(layer, theme))}" style="${image}"></div>`;
}

function sceneHtml(scene) {
  return `<!doctype html><meta charset="utf-8"><style>
  html, body { margin: 0; background: #000; }
  .scene { position: relative; width: ${stage.width}px; height: ${stage.height}px; overflow: hidden; isolation: isolate; }
  .scene::before, .scene::after { content: ""; position: absolute; inset: 0; z-index: -1; }
  .light { background: linear-gradient(155deg, #fbf7f1 0%, #f5ece1 52%, #eee1d2 100%); }
  .light::before { background: radial-gradient(60% 70% at 92% 8%, rgba(236, 137, 64, 0.30), transparent 70%), radial-gradient(50% 60% at 4% 100%, rgba(255, 255, 255, 0.9), transparent 70%); }
  .dark { background: linear-gradient(155deg, #1a161f 0%, #121015 55%, #0d0b10 100%); }
  .dark::before { background: radial-gradient(55% 65% at 90% 6%, rgba(232, 135, 58, 0.30), transparent 70%), radial-gradient(55% 70% at 0% 100%, rgba(96, 66, 245, 0.24), transparent 72%); }
  .scene::after { background-image: radial-gradient(currentColor 1px, transparent 1.2px); background-size: 22px 22px; opacity: 0.05; }
  .light::after { color: #5b3a1e; }
  .dark::after { color: #ffffff; }
  .layer { position: absolute; overflow: hidden; border-radius: 22px; }
  .layer img { position: absolute; max-width: none; }
  .light .panel, .light .window { box-shadow: 0 0 0 1px rgba(60, 40, 20, 0.10), 0 2px 4px rgba(60, 40, 20, 0.06), 0 24px 48px -12px rgba(80, 50, 20, 0.28); }
  .dark .panel, .dark .window { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.10), 0 2px 4px rgba(0, 0, 0, 0.3), 0 28px 60px -12px rgba(0, 0, 0, 0.7); }
  .callout { border-radius: 18px; }
  .light .callout { box-shadow: 0 0 0 1px rgba(60, 40, 20, 0.12), 0 6px 12px rgba(60, 40, 20, 0.10), 0 36px 70px -16px rgba(80, 50, 20, 0.45); }
  .dark .callout { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16), 0 6px 12px rgba(0, 0, 0, 0.35), 0 40px 80px -16px rgba(0, 0, 0, 0.85); }
  .lift { overflow: hidden; filter: drop-shadow(0 30px 40px rgba(0, 0, 0, 0.55)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)); }
  .tilt { transform: perspective(1800px) rotateY(-9deg) rotateX(5deg) rotateZ(1deg); transform-origin: 40% 50%; }
</style><div class="scene ${scene.theme}">${scene.layers.map((layer) => layerHtml(layer, scene.theme)).join("")}</div>`;
}

const only = args.only?.split(",");
const unknown = only?.filter((name) => !scenes.some((scene) => scene.name === name)) ?? [];
if (unknown.length > 0) throw new Error(`unknown scene: ${unknown.join(", ")}`);
const selected = scenes.filter((scene) => !only || only.includes(scene.name));
const missing = selected.flatMap((scene) => scene.layers.map((layer) => stillPath(layer, scene.theme))).filter((file) => !existsSync(file));
if (missing.length > 0) throw new Error(`missing captures:\n${[...new Set(missing)].join("\n")}`);

const work = mkdtempSync(path.join(tmpdir(), "home-scenes-"));
const outDir = path.join(siteRoot, "images", "home");
mkdirSync(outDir, { recursive: true });
for (const scene of selected) {
  const htmlPath = path.join(work, `${scene.name}.html`);
  const pngPath = path.join(work, `${scene.name}.png`);
  writeFileSync(htmlPath, sceneHtml(scene));
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--force-device-scale-factor=${(2 * scene.width) / stage.width}`,
    "--allow-file-access-from-files", `--window-size=${stage.width},${stage.height}`, `--screenshot=${pngPath}`, pathToFileURL(htmlPath).href], { stdio: "ignore" });
  const smallPath = path.join(work, `${scene.name}-${scene.width}.png`);
  execFileSync("magick", [pngPath, "-filter", "Lanczos", "-resize", "50%", smallPath]);
  for (const [source, suffix] of [[pngPath, ""], [smallPath, `-${scene.width}`]]) {
    execFileSync("cwebp", ["-quiet", "-q", "88", "-m", "6", source, "-o", path.join(outDir, `${scene.name}${suffix}.webp`)]);
  }
  console.log(scene.name);
}
console.log(`html and png in ${work}`);
