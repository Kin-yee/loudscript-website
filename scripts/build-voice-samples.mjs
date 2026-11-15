// Builds data/voice-samples.json: the word timings the home page uses to light
// the sample sentence while a bundled voice preview plays.
//
//   node scripts/build-voice-samples.mjs            rebuild from the cached analysis
//   node scripts/build-voice-samples.mjs --analyze  rerun Whisper and ffmpeg first
//
// --analyze needs `whisper` (openai-whisper) and `ffmpeg` on PATH. It writes
// data/voice-samples/<clip>.json, so a normal rebuild needs neither tool.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analysisDir = path.join(siteRoot, "data", "voice-samples");
const outputPath = path.join(siteRoot, "data", "voice-samples.json");

// The sentences are the Mac app's `onboarding.first_read.sample_text`, which is
// what each clip speaks. Chinese has no spaces, so `|` marks its word breaks.
// The Mandarin clip speaks the Simplified wording; the Traditional page shows
// its own wording and takes each word's timing from the matching spoken word.
const mandarin = "欢迎！|在|任意|应用|中|选择|文本，|按下|快捷键，|即可|听到|朗读。";
const clips = {
  "supertonic.en": {
    voice: "supertonic", label: "Supertonic", lang: "en", whisper: "en", file: "supertonic.v3.en.m4a",
    text: "Welcome! Select text in any app, press the shortcut, and hear it read aloud."
  },
  "supertonic.de": {
    voice: "supertonic", label: "Supertonic", lang: "de", whisper: "de", file: "supertonic.v3.de.m4a",
    text: "Willkommen! Wähle in einer beliebigen App Text aus, drücke das Tastenkürzel, und er wird dir vorgelesen."
  },
  "supertonic.es": {
    voice: "supertonic", label: "Supertonic", lang: "es", whisper: "es", file: "supertonic.v3.es.m4a",
    text: "¡Te damos la bienvenida! Selecciona texto en cualquier aplicación, pulsa el atajo y lo escucharás en voz alta."
  },
  "supertonic.fr": {
    voice: "supertonic", label: "Supertonic", lang: "fr", whisper: "fr", file: "supertonic.v3.fr.m4a",
    text: "Bienvenue ! Sélectionnez du texte dans n’importe quelle application, appuyez sur le raccourci, et il vous sera lu à voix haute."
  },
  "supertonic.nl": {
    voice: "supertonic", label: "Supertonic", lang: "nl", whisper: "nl", file: "supertonic.v3.nl.m4a",
    text: "Welkom! Selecteer tekst in een willekeurige app, druk op de sneltoets en de tekst wordt voorgelezen."
  },
  "kokoro.en": {
    voice: "kokoro", label: "Kokoro", lang: "en", whisper: "en", file: "kokoro.82m.en.m4a",
    text: "Welcome! Select text in any app, press the shortcut, and hear it read aloud."
  },
  "kokoro.zh-Hans": {
    voice: "kokoro", label: "Kokoro", lang: "zh-Hans", whisper: "zh", file: "kokoro.82m.zh.m4a",
    text: mandarin
  },
  "kokoro.zh-Hant": {
    voice: "kokoro", label: "Kokoro", lang: "zh-Hant", whisper: "zh", file: "kokoro.82m.zh.m4a",
    text: "歡迎！|在|任何|應用程式|中|選取|文字，|按下|快捷鍵，|即可|聽到|朗讀。",
    spoken: mandarin
  }
};

// The first clip is the one a page starts on. Japanese has no preview clip, so
// it uses the English sample.
const pages = {
  en: ["supertonic.en", "kokoro.en"],
  de: ["supertonic.de", "kokoro.en"],
  es: ["supertonic.es", "kokoro.en"],
  fr: ["supertonic.fr", "kokoro.en"],
  nl: ["supertonic.nl", "kokoro.en"],
  ja: ["supertonic.en", "kokoro.en"],
  "zh-Hans": ["kokoro.zh-Hans", "supertonic.en"],
  "zh-Hant": ["kokoro.zh-Hant", "supertonic.en"]
};

const round = (seconds) => Math.round(seconds * 1000) / 1000;

function transcribe(audioPath, language) {
  const scratch = mkdtempSync(path.join(tmpdir(), "voice-sample-"));
  try {
    execFileSync("whisper", [
      audioPath, "--model", "small", "--language", language, "--word_timestamps", "True",
      "--fp16", "False", "--output_format", "json", "--output_dir", scratch
    ], { stdio: ["ignore", "ignore", "inherit"] });
    const transcript = JSON.parse(readFileSync(path.join(scratch, `${path.parse(audioPath).name}.json`), "utf8"));
    return transcript.segments.flatMap((segment) => segment.words)
      .map(({ word, start, end }) => ({ word: word.trim(), start: round(start), end: round(end) }));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function measureSilences(audioPath) {
  const duration = Number(execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audioPath
  ], { encoding: "utf8" }));
  // ffmpeg reports the filter's findings on stderr.
  const { stderr } = spawnSync("ffmpeg", [
    "-hide_banner", "-nostats", "-i", audioPath, "-af", "silencedetect=noise=-35dB:d=0.12", "-f", "null", "-"
  ], { encoding: "utf8" });
  const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((match) => Number(match[1]));
  const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((match) => Number(match[1]));
  if (starts.length === 0) throw new Error(`${audioPath}: ffmpeg found no pauses`);
  return { duration: round(duration), silences: starts.map((start, index) => [round(start), round(ends[index] ?? duration)]) };
}

function analysisPath(clip) {
  return path.join(analysisDir, `${path.parse(clip.file).name}.json`);
}

function writeAnalysis(clip) {
  const audioPath = path.join(siteRoot, "audio", clip.file);
  const analysis = { ...measureSilences(audioPath), words: transcribe(audioPath, clip.whisper) };
  writeFileSync(analysisPath(clip), `${JSON.stringify(analysis)}\n`);
}

const letters = (value) => [...value.normalize("NFD").toLowerCase()].filter((char) => /[\p{L}\p{N}]/u.test(char));

// Splits a sentence into the units the page lights one at a time. Punctuation
// that stands alone, like the French " !", joins the word before it.
function units(sentence) {
  if (sentence.includes("|")) {
    let offset = 0;
    return sentence.split("|").map((word) => ({ from: offset, to: (offset += word.length), word }));
  }
  const found = [];
  for (const match of sentence.matchAll(/\S+/g)) {
    const previous = found.at(-1);
    if (previous && letters(match[0]).length === 0) previous.to = match.index + match[0].length;
    else found.push({ from: match.index, to: match.index + match[0].length, word: match[0] });
  }
  return found;
}

// Whisper hears the right sounds but not always the right spelling ("here" for
// "hear"), so the known sentence is matched to its transcript letter by letter
// and each unit takes the time of the letters it lands on.
function alignToTranscript(spokenUnits, words) {
  const spoken = spokenUnits.flatMap((unit, index) => letters(unit.word).map((char) => ({ char, unit: index })));
  const heard = words.flatMap(({ word, start, end }) => {
    const chars = letters(word);
    const step = (end - start) / chars.length;
    return chars.map((char, index) => ({ char, start: start + index * step, end: start + (index + 1) * step }));
  });

  const cost = Array.from({ length: spoken.length + 1 }, (_, row) =>
    Array.from({ length: heard.length + 1 }, (_, column) => (row === 0 ? column : column === 0 ? row : 0)));
  for (let row = 1; row <= spoken.length; row++) {
    for (let column = 1; column <= heard.length; column++) {
      const same = spoken[row - 1].char === heard[column - 1].char ? 0 : 1;
      cost[row][column] = Math.min(cost[row - 1][column - 1] + same, cost[row - 1][column] + 1, cost[row][column - 1] + 1);
    }
  }

  const spans = spokenUnits.map(() => ({ start: Infinity, end: -Infinity }));
  let row = spoken.length;
  let column = heard.length;
  while (row > 0 && column > 0) {
    const same = spoken[row - 1].char === heard[column - 1].char ? 0 : 1;
    if (cost[row][column] === cost[row - 1][column - 1] + same) {
      const span = spans[spoken[row - 1].unit];
      span.start = Math.min(span.start, heard[column - 1].start);
      span.end = Math.max(span.end, heard[column - 1].end);
      row--;
      column--;
    } else if (cost[row][column] === cost[row - 1][column] + 1) row--;
    else column--;
  }
  return { spans, distance: cost[spoken.length][heard.length], length: spoken.length, heardLength: heard.length };
}

// Whisper places a word after a pause anywhere inside that pause, up to a
// quarter second off. The pauses themselves are measured from the audio, so
// each stretch of speech between two pauses fixes where its first word starts
// and its last word ends; Whisper only places the words inside a stretch.
function snapToSpeech(spans, spokenUnits, { duration, silences }) {
  const stretches = [];
  let cursor = 0;
  for (const [start, end] of silences) {
    if (start - cursor > 0.05) stretches.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (duration - cursor > 0.05) stretches.push([cursor, duration]);

  let current = 0;
  const stretchOf = spans.map((span, index) => {
    // Whisper lets a word run across a whole pause. Voices pause at punctuation,
    // so a word that opens a clause sits after the pause and one that closes a
    // clause sits before it. Otherwise the longer side holds the word.
    const crossed = silences.find(([from, to]) => span.start < from && span.end > to);
    const endsClause = (unit) => /\p{P}$/u.test(unit?.word ?? "");
    const afterPause = crossed && (endsClause(spokenUnits[index - 1])
      || (!endsClause(spokenUnits[index]) && span.end - crossed[1] > crossed[0] - span.start));
    const start = afterPause ? crossed[1] : span.start;
    const end = crossed && !afterPause ? crossed[0] : span.end;
    const overlap = (index) => Math.min(end, stretches[index][1]) - Math.max(start, stretches[index][0]);
    let best = current;
    for (let index = current + 1; index < stretches.length; index++) {
      if (overlap(index) > overlap(best)) best = index;
    }
    if (overlap(best) <= 0) {
      // Whisper put the whole word inside a pause, so it belongs to the speech that follows.
      const next = stretches.findIndex(([, to], index) => index >= current && to > start);
      if (next !== -1) best = next;
    }
    current = best;
    return best;
  });

  const shortest = 0.06;
  const starts = [];
  spans.forEach(({ start }, index) => {
    const [from, to] = stretches[stretchOf[index]];
    const opensStretch = index === 0 || stretchOf[index - 1] !== stretchOf[index];
    starts.push(opensStretch ? from : Math.min(Math.max(start, starts[index - 1] + shortest), to - shortest));
  });
  return starts.map((start, index) => ({
    start: round(start),
    end: round(stretchOf[index + 1] === stretchOf[index] ? starts[index + 1] : stretches[stretchOf[index]][1])
  }));
}

function buildSample(id) {
  const clip = clips[id];
  const analysis = JSON.parse(readFileSync(analysisPath(clip), "utf8"));
  const shown = units(clip.text);
  const spoken = units(clip.spoken ?? clip.text);
  if (shown.length !== spoken.length) throw new Error(`${id}: shown and spoken sentences split into different word counts`);

  const { spans, distance, length, heardLength } = alignToTranscript(spoken, analysis.words);
  // A transcript far from the known sentence means the timings cannot be trusted.
  // Whisper writes Mandarin in Traditional characters, so there only length is compared.
  const tolerance = clip.whisper === "zh" ? Math.abs(length - heardLength) / length : distance / length;
  if (tolerance > 0.2) throw new Error(`${id}: transcript differs from the sentence by ${Math.round(tolerance * 100)}%`);
  if (spans.some(({ start }) => !Number.isFinite(start))) throw new Error(`${id}: a word matched nothing in the transcript`);

  const times = snapToSpeech(spans, spoken, analysis);
  times.forEach(({ start, end }, index) => {
    if (end - start < 0.05 || (index > 0 && start < times[index - 1].end)) {
      throw new Error(`${id}: word ${index} (${shown[index].word}) has an impossible timing ${start}–${end}`);
    }
  });

  return {
    voice: clip.voice,
    label: clip.label,
    lang: clip.lang,
    src: `/audio/${clip.file}`,
    text: clip.text.replaceAll("|", ""),
    words: shown.map(({ from, to }, index) => ({ ...times[index], from, to }))
  };
}

if (process.argv.includes("--analyze")) {
  const analyzed = new Set();
  for (const clip of Object.values(clips)) {
    if (analyzed.has(clip.file)) continue;
    analyzed.add(clip.file);
    writeAnalysis(clip);
    console.log(`Analyzed ${clip.file}`);
  }
}

const samples = Object.fromEntries(Object.entries(pages).map(([locale, ids]) => [locale, ids.map(buildSample)]));
writeFileSync(outputPath, `${JSON.stringify(samples, null, 1)}\n`);
console.log(`Built ${path.relative(siteRoot, outputPath)}`);
