import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { lessonFrontmatterSchema, type LessonFrontmatter } from "./graph-schema";
import { graph } from "@/content/graph";
import type { Locale } from "@/i18n/routing";

export type LoadedLesson = {
  frontmatter: LessonFrontmatter;
  body: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons");

export async function loadLesson(
  locale: Locale,
  id: string,
): Promise<LoadedLesson | null> {
  const filePath = path.join(CONTENT_ROOT, locale, `${id}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
  const parsed = matter(raw);
  const fm = lessonFrontmatterSchema.parse({ id, ...parsed.data });
  return { frontmatter: fm, body: parsed.content };
}

export async function loadAllLessons(
  locale: Locale,
): Promise<Map<string, LoadedLesson>> {
  const out = new Map<string, LoadedLesson>();
  for (const node of graph.nodes) {
    const lesson = await loadLesson(locale, node.id);
    if (lesson) out.set(node.id, lesson);
  }
  return out;
}

export function nextAvailable(
  currentId: string,
  done: Set<string>,
  lessons: Map<string, LoadedLesson>,
): string | null {
  for (const node of graph.nodes) {
    if (node.id === currentId) continue;
    if (done.has(node.id)) continue;
    const fm = lessons.get(node.id)?.frontmatter;
    if (!fm) continue;
    const ready = fm.prerequisites.every((p) => done.has(p));
    if (ready) return node.id;
  }
  return null;
}
