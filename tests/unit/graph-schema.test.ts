import { describe, it, expect } from "vitest";
import { lessonFrontmatterSchema } from "@/lib/graph-schema";

const base = {
  id: "example",
  title: "Title",
  summary: "Summary",
  hook: {
    situation: "Something unexpected happened.",
    question: "Why?",
  },
  quiz: [
    {
      question: "Q",
      options: ["a", "b"],
      correct: 0,
    },
  ],
};

describe("lessonFrontmatterSchema", () => {
  it("accepts minimal valid frontmatter", () => {
    const parsed = lessonFrontmatterSchema.parse(base);
    expect(parsed.prerequisites).toEqual([]);
    expect(parsed.estimatedMinutes).toBe(10);
  });

  it("rejects non-kebab id", () => {
    expect(() =>
      lessonFrontmatterSchema.parse({ ...base, id: "Not_Kebab" }),
    ).toThrow();
  });

  it("requires at least one quiz item", () => {
    expect(() =>
      lessonFrontmatterSchema.parse({ ...base, quiz: [] }),
    ).toThrow();
  });

  it("requires at least two quiz options", () => {
    expect(() =>
      lessonFrontmatterSchema.parse({
        ...base,
        quiz: [{ question: "Q", options: ["only"], correct: 0 }],
      }),
    ).toThrow();
  });
});
