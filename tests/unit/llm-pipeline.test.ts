import { describe, it, expect } from "vitest";
import { simpleTokenize } from "@/components/experiments/LLMPipelinePlayground";
import ru from "@/messages/ru.json";
import ky from "@/messages/ky.json";

type Sample = { input: string; output: string };

const SAMPLES: Record<string, Sample[]> = {
  ru: ru.experiments.llmPipeline.samples,
  ky: ky.experiments.llmPipeline.samples,
};

describe("llm pipeline: the prompts are in the learner's language", () => {
  it("ships the same number of samples in both locales", () => {
    expect(SAMPLES.ky).toHaveLength(SAMPLES.ru.length);
    expect(SAMPLES.ru.length).toBeGreaterThan(0);
  });

  for (const [locale, samples] of Object.entries(SAMPLES)) {
    it(`tokenizes every ${locale} sample into whole words`, () => {
      for (const { input, output } of samples) {
        for (const text of [input, output]) {
          const tokens = simpleTokenize(text);
          // Nothing is dropped: joining the tokens gives the text back minus
          // whitespace. A letter falling outside the tokenizer's alphabet would
          // still survive as a one-char token, so this alone is not enough.
          expect(tokens.join("")).toBe(text.replace(/\s/g, ""));
        }
      }
    });
  }

  it("keeps Kyrgyz-specific letters inside their word", () => {
    // ө, ү, ң sit outside the Cyrillic а-я range. Under a naive range-based
    // regex each of them split off as its own punctuation token, chopping most
    // Kyrgyz words into fragments.
    expect(simpleTokenize("көк")).toEqual(["көк"]);
    expect(simpleTokenize("үйрөнөт")).toEqual(["үйр", "өнө", "т"]);
    expect(simpleTokenize("мыйзам ченемдүүлүк")).toEqual([
      "мый",
      "зам",
      "чен",
      "емд",
      "үүл",
      "үк",
    ]);
  });

  it("splits words into subword chunks, not whole words", () => {
    // The reveal claims a token is a piece of a word, ~2-4 characters.
    const tokens = simpleTokenize(SAMPLES.ky[0].output);
    expect(Math.max(...tokens.map((t) => t.length))).toBeLessThanOrEqual(4);
  });
});
