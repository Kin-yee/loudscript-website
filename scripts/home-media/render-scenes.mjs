// Stages real LoudScript for Mac captures into the home page card images.
//
//   node scripts/home-media/render-scenes.mjs --raw /tmp/ls-capture/raw [--only proofread,ocr]
//
// --raw holds stills-light/ and stills-dark/: 2304x1440 Retina window captures
// of the same seeded history in each appearance. Crops are in window points
// (1152x720). Scenes are laid out on a 1000x625 stage, rendered by headless
// Chrome at twice the card width, and encoded with cwebp. Needs Google Chrome, magick and cwebp.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const { values: args } = parseArgs({ options: { raw: { type: "string" }, only: { type: "string" } } });
if (!args.raw) throw new Error("--raw <dir with stills-light/ and stills-dark/> is required");

const audience = { width: 600 };
const guide = { width: 480 };

// kind: "window" keeps the macOS window corners, "panel" is a crop through the
// UI, "callout" is a crop lifted in front, "float" is a transparent capture.
const scenes = [
  {
    name: "audience-proofread", ...audience, theme: "dark",
    layers: [
      { kind: "panel", still: "proofread-playing", crop: [250, 150, 670, 570], at: [60, 70, 700] },
      { kind: "callout", still: "proofread-playing", crop: [940, 170, 200, 86], at: [630, 405, 300] },
    ],
  },
  {
    name: "audience-study", ...audience, theme: "light",
    layers: [
      { kind: "panel", still: "pdf-playing", crop: [270, 140, 418, 470], at: [70, 60, 470] },
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
      { kind: "window", still: "lecture-playing", crop: [0, 0, 1152, 720], at: [-40, 40, 900], dim: true },
      { kind: "float", still: "overlay-alpha", size: [420, 243], at: [330, 190, 600] },
    ],
  },
  {
    name: "guide-selected-text", ...guide, theme: "dark",
    layers: [
      { kind: "panel", still: "trees-overview", crop: [250, 60, 900, 420], at: [60, 90, 820] },
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
      { kind: "panel", still: "model-menu-composite", crop: [236, 562, 700, 212], at: [30, 130, 940] },
    ],
  },
  {
    name: "guide-pdf", ...guide, theme: "light",
    layers: [
      { kind: "panel", still: "pdf-playing", crop: [270, 140, 418, 470], at: [60, 70, 440] },
      { kind: "callout", still: "pdf-playing", crop: [710, 170, 384, 420], at: [480, 120, 460] },
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

function layerHtml(layer, theme) {
  const src = `file://${path.resolve(args.raw, `stills-${theme}`, `${layer.still}.png`)}`;
  const [left, top, width] = layer.at;
  if (layer.kind === "float") {
    const height = (width * layer.size[1]) / layer.size[0];
    return `<img class="float" src="${src}" style="left:${left}px;top:${top}px;width:${width}px;height:${height}px">`;
  }
  const [x, y, w, h] = layer.crop;
  const scale = width / w;
  const classes = ["layer", layer.kind, layer.tilt ? "tilt" : "", layer.dim ? "dim" : ""].join(" ");
  return `<div class="${classes}" style="left:${left}px;top:${top}px;width:${width}px;height:${h * scale}px;--r:${layer.kind === "window" ? 13 * scale : 0}px">`
    + `<img src="${src}" style="width:${1152 * scale}px;left:${-x * scale}px;top:${-y * scale}px"></div>`;
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
  .window { border-radius: var(--r); }
  .light .layer { box-shadow: 0 0 0 1px rgba(60, 40, 20, 0.10), 0 2px 4px rgba(60, 40, 20, 0.06), 0 24px 48px -12px rgba(80, 50, 20, 0.28); }
  .dark .layer { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.10), 0 2px 4px rgba(0, 0, 0, 0.3), 0 28px 60px -12px rgba(0, 0, 0, 0.7); }
  .callout { border-radius: 18px; }
  .light .callout { box-shadow: 0 0 0 1px rgba(60, 40, 20, 0.12), 0 6px 12px rgba(60, 40, 20, 0.10), 0 36px 70px -16px rgba(80, 50, 20, 0.45); }
  .dark .callout { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16), 0 6px 12px rgba(0, 0, 0, 0.35), 0 40px 80px -16px rgba(0, 0, 0, 0.85); }
  .tilt { transform: perspective(1800px) rotateY(-9deg) rotateX(5deg) rotateZ(1deg); transform-origin: 40% 50%; }
  .dim { filter: blur(3px) brightness(0.55) saturate(0.8); }
  .float { position: absolute; filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 0.5px rgba(255, 255, 255, 0.4)); }
</style><div class="scene ${scene.theme}">${scene.layers.map((layer) => layerHtml(layer, scene.theme)).join("")}</div>`;
}

const work = mkdtempSync(path.join(tmpdir(), "home-scenes-"));
const outDir = path.join(siteRoot, "images", "home");
mkdirSync(outDir, { recursive: true });
const only = args.only?.split(",");
for (const scene of scenes.filter((s) => !only || only.some((name) => s.name.endsWith(name)))) {
  const htmlPath = path.join(work, `${scene.name}.html`);
  const pngPath = path.join(work, `${scene.name}.png`);
  writeFileSync(htmlPath, sceneHtml(scene));
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--force-device-scale-factor=${(2 * scene.width) / stage.width}`, "--allow-file-access-from-files",
    `--window-size=${stage.width},${stage.height}`, `--screenshot=${pngPath}`, `file://${htmlPath}`], { stdio: "ignore" });
  const smallPath = path.join(work, `${scene.name}-${scene.width}.png`);
  execFileSync("magick", [pngPath, "-filter", "Lanczos", "-resize", "50%", smallPath]);
  for (const [source, suffix] of [[pngPath, ""], [smallPath, `-${scene.width}`]]) {
    execFileSync("cwebp", ["-quiet", "-q", "88", "-m", "6", source, "-o", path.join(outDir, `${scene.name}${suffix}.webp`)]);
  }
  console.log(scene.name);
}
console.log(`html and png in ${work}`);
