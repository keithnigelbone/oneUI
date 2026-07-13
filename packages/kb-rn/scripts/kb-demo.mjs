#!/usr/bin/env node
/**
 * KB power demo — standalone, zero-dependency, runs INSIDE the jds-kb repo:
 *
 *   pnpm --filter @jds/kb-rn kb:demo
 *
 * For JDS developers: shows, against the repo's own `dist/` artifacts + the
 * real `@oneui/ui-native` source, the full savings spectrum (not a single
 * number) + sample graph answers. No external tooling, no network — just the KB.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "..", "dist");
const repoRoot = resolve(here, "..", "..", "..");
const UI_NATIVE = join(repoRoot, "packages", "ui-native", "src", "components");

if (!existsSync(join(dist, "kb-graph.json"))) {
  console.error("[kb:demo] dist/kb-graph.json missing — run `pnpm --filter @jds/kb-rn build` first.");
  process.exit(1);
}
const graph = JSON.parse(readFileSync(join(dist, "kb-graph.json"), "utf8"));
const metas = JSON.parse(readFileSync(join(dist, "components.json"), "utf8"));
const byName = new Map(metas.map((m) => [m.name, m]));
const tok = (s) => Math.ceil((typeof s === "string" ? s : JSON.stringify(s)).length / 4);

// ── source-reading cost for a component (the files an agent opens) ──────────
function dirFor(meta) {
  for (const d of [meta.importPath?.split("/").pop(), meta.name].filter(Boolean)) {
    if (existsSync(join(UI_NATIVE, d, "interface.ts")) || existsSync(join(UI_NATIVE, d, `${d}.native.tsx`))) return d;
  }
  return null;
}
function sourceTokens(meta) {
  const d = dirFor(meta);
  if (!d) return 0;
  const dir = join(UI_NATIVE, d);
  return readdirSync(dir)
    .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.(test|spec|stories)\./.test(f))
    .reduce((s, f) => s + tok(readFileSync(join(dir, f), "utf8")), 0);
}

// ── lean KB card: what an agent actually needs to USE a component ───────────
function leanCard(meta) {
  const id = `rn:component:${meta.name}`;
  const children = {};
  for (const e of graph.edges.filter((e) => e.from === id && e.kind === "COMPOSES")) {
    (children[e.slot || "items"] ??= []).push(e.to.split(":").pop());
  }
  const props = Object.entries(meta.propsSchema?.properties ?? {}).map(([n, s]) => ({
    n, ...(s.enum ? { enum: s.enum } : {}), ...(s["x-jds-suggestion"] ? { warn: 1 } : {}),
  }));
  const rules = Object.entries(meta.propsSchema?.properties ?? {})
    .filter(([, s]) => s["x-jds-suggestion"]).map(([n, s]) => `${n}: ${s["x-jds-suggestion"]}`);
  return { name: meta.name, status: meta.status, children, props, rules };
}

const L = (c = "─") => console.log(c.repeat(72));
L("═"); console.log("  JDS KB — POWER DEMO  (standalone, in-repo)"); L("═");
console.log(`  graph: ${graph.stats.nodes} nodes / ${graph.stats.edges} edges over ${metas.length} components\n`);

const allSourceTokens = metas.reduce((s, m) => s + sourceTokens(m), 0);
const rosterTokens = tok({ components: metas.map((m) => m.name), stats: graph.stats });

// scenario 1 — discover the library
console.log("① DISCOVER THE LIBRARY  (what exists + the graph)");
console.log(`   read all component source ≈ ${allSourceTokens.toLocaleString()} tok   vs   KB roster+graph ≈ ${rosterTokens.toLocaleString()} tok`);
console.log(`   → ${Math.round((1 - rosterTokens / allSourceTokens) * 100)}% fewer\n`);

// scenario 2 — one component's contract
const sample = "CheckboxField";
const sm = byName.get(sample);
console.log(`② ONE COMPONENT'S CONTRACT  (${sample})`);
console.log(`   read its source ≈ ${sourceTokens(sm).toLocaleString()} tok   vs   kb card ≈ ${tok(leanCard(sm)).toLocaleString()} tok`);
console.log(`   → ${Math.round((1 - tok(leanCard(sm)) / sourceTokens(sm)) * 100)}% fewer   (valid children: ${Object.entries(leanCard(sm).children).map(([s, c]) => s + "=" + c.join("/")).join(", ")})\n`);

// scenario 3 — build a feature (lean cards, rules only for those components)
const task = ["CheckboxField", "Checkbox", "InputFeedback", "IconButton", "Icon"];
const taskSrc = task.reduce((s, n) => s + sourceTokens(byName.get(n)), 0);
const taskKb = task.reduce((s, n) => s + tok(leanCard(byName.get(n))), 0);
console.log(`③ BUILD A FEATURE  ("validated checkbox group" — ${task.length} components)`);
console.log(`   read source ≈ ${taskSrc.toLocaleString()} tok   vs   lean kb cards ≈ ${taskKb.toLocaleString()} tok`);
console.log(`   → ${Math.round((1 - taskKb / taskSrc) * 100)}% fewer\n`);

L();
console.log("  Plus what source-reading can't cheaply give at all:");
console.log("   • valid-children per slot (graph)   • figma-key → component   • find-by-intent");
console.log("   • the JDS rules, machine-readable   • can't go stale (kb:check gate)");
L("═");
