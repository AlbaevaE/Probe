#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function loadGraph() {
  const src = await fs.readFile(path.join(root, "content/graph.ts"), "utf8");
  const ids = [];
  const re = /id:\s*"([a-z0-9-]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) ids.push(m[1]);
  if (ids.length === 0) throw new Error("graph.ts has no node ids");
  return ids;
}

async function readLesson(locale, id) {
  const p = path.join(root, "content/lessons", locale, `${id}.mdx`);
  const raw = await fs.readFile(p, "utf8").catch(() => null);
  if (raw == null) return null;
  return matter(raw).data;
}

function check(cond, msg, errors) {
  if (!cond) errors.push(msg);
}

const errors = [];
const ids = await loadGraph();
const idSet = new Set(ids);
const locales = ["ru", "ky"];

for (const locale of locales) {
  for (const id of ids) {
    const fm = await readLesson(locale, id);
    if (!fm) {
      errors.push(`[${locale}] missing lesson file: ${id}.mdx`);
      continue;
    }
    check(typeof fm.title === "string" && fm.title.length > 0, `[${locale}/${id}] title missing`, errors);
    check(typeof fm.summary === "string" && fm.summary.length > 0, `[${locale}/${id}] summary missing`, errors);
    check(
      fm.hook && typeof fm.hook.situation === "string" && fm.hook.situation.length > 0 && typeof fm.hook.question === "string" && fm.hook.question.length > 0,
      `[${locale}/${id}] hook.situation and hook.question are required`,
      errors,
    );
    check(Array.isArray(fm.quiz) && fm.quiz.length > 0, `[${locale}/${id}] quiz missing`, errors);
    const prereqs = fm.prerequisites ?? [];
    for (const p of prereqs) {
      if (!idSet.has(p)) {
        errors.push(`[${locale}/${id}] unknown prerequisite: ${p}`);
      }
    }
    if (Array.isArray(fm.quiz)) {
      fm.quiz.forEach((q, i) => {
        const opts = Array.isArray(q.options) ? q.options.length : 0;
        check(opts >= 2, `[${locale}/${id}] quiz[${i}] needs ≥2 options`, errors);
        check(
          typeof q.correct === "number" && q.correct >= 0 && q.correct < opts,
          `[${locale}/${id}] quiz[${i}] correct index out of range`,
          errors,
        );
      });
    }
  }
}

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`Content OK: ${ids.length} lessons × ${locales.length} locales`);
