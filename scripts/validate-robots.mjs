import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Pass --url https://loudscript.app/robots.txt to check the file crawlers are actually served.
const urlFlag = process.argv.indexOf("--url");
async function fetchRobots(url) {
  assert(url, "--url needs a robots.txt URL");
  const response = await fetch(url);
  assert(response.ok, `${url}: HTTP ${response.status}`);
  return response.text();
}
const robots = urlFlag === -1
  ? await readFile(new URL("../robots.txt", import.meta.url), "utf8")
  : await fetchRobots(process.argv[urlFlag + 1]);

const groups = [];
let current;
for (const line of robots.split(/\r?\n/).map((raw) => raw.replace(/#.*/, "").trim()).filter(Boolean)) {
  const separator = line.indexOf(":");
  if (separator === -1) continue;
  const field = line.slice(0, separator).trim().toLowerCase();
  const value = line.slice(separator + 1).trim();
  if (field === "user-agent") {
    if (!current || current.rules.length) groups.push(current = { agents: [], rules: [] });
    current.agents.push(value.toLowerCase());
  } else if ((field === "allow" || field === "disallow") && current) {
    current.rules.push({ allow: field === "allow", path: value });
  }
}

function pathPattern(rulePath) {
  const anchored = rulePath.endsWith("$");
  const body = (anchored ? rulePath.slice(0, -1) : rulePath)
    .split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

function canFetch(agent, url) {
  const name = agent.toLowerCase();
  const named = groups.filter(({ agents }) => agents.includes(name));
  const applicable = named.length ? named : groups.filter(({ agents }) => agents.includes("*"));
  const match = applicable.flatMap(({ rules }) => rules)
    .filter(({ path }) => path && pathPattern(path).test(url))
    .sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow))[0];
  return match ? match.allow : true;
}

const searchAndAssistants = ["Googlebot", "Bingbot", "Applebot", "Baiduspider", "YandexBot",
  "DuckDuckBot", "DuckAssistBot", "Google-Extended", "OAI-SearchBot", "ChatGPT-User",
  "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "MistralAI-User",
  "Amzn-SearchBot", "meta-webindexer", "Meta-ExternalFetcher"];
const trainingOnly = ["GPTBot", "ClaudeBot", "CCBot", "Applebot-Extended", "Bytespider", "Amazonbot",
  "meta-externalagent"];
const publicPaths = ["/", "/download/", "/llms.txt", "/sitemap.xml",
  ...["zh-hant", "zh-hans", "de", "es", "fr", "ja", "nl"].map((locale) => `/${locale}/`)];

for (const agent of searchAndAssistants) {
  for (const url of publicPaths) assert(canFetch(agent, url), `${agent} must be allowed to fetch ${url}`);
}
for (const agent of trainingOnly) assert(!canFetch(agent, "/"), `${agent} must be disallowed`);
assert.equal(groups.filter(({ agents }) => agents.includes("*")).length, 1, "exactly one * group");
assert.match(robots, /^Sitemap: https:\/\/loudscript\.app\/sitemap\.xml$/m);
assert.match(robots, /^Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference$/m,
  "robots.txt must let AI systems use pages as answer input");
console.log(`Validated robots.txt for ${searchAndAssistants.length + trainingOnly.length} crawlers.`);
