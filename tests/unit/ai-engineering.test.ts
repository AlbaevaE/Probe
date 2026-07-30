import { describe, it, expect } from "vitest";
import { softmax, sampleCounts } from "@/components/experiments/TemperaturePlayground";
import { scoreDoc, tokenize } from "@/components/experiments/RetrievalPlayground";
import { trainBPE, countTokens, CORPUS } from "@/components/experiments/TokenizerPlayground";
import ru from "@/messages/ru.json";
import ky from "@/messages/ky.json";

const locales = { ru, ky } as const;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("temperature sampling", () => {
  const logits = [4.2, 3.1, 2.2, 1.0, -0.5, -2.0];

  it("softmax sums to 1 and preserves ranking", () => {
    for (const t of [0.2, 1.0, 2.0]) {
      const p = softmax(logits, t);
      expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
      for (let i = 1; i < p.length; i++) expect(p[i]).toBeLessThan(p[i - 1]);
    }
  });

  it("low temperature is near-deterministic, high temperature lets bad words through", () => {
    let nonsenseSeeds = 0;
    for (let seed = 7; seed < 27; seed++) {
      const rng = mulberry32(seed);
      const low = sampleCounts(softmax(logits, 0.2), 40, rng);
      const high = sampleCounts(softmax(logits, 2.0), 40, rng);
      // T=0.2: the top word must dominate
      expect(low[0]).toBeGreaterThanOrEqual(37);
      // T=2.0: the top word must NOT dominate
      expect(high[0]).toBeLessThanOrEqual(30);
      if (high[4] + high[5] > 0) nonsenseSeeds++;
    }
    // the "even nonsense gets through" claim must hold for most reshuffles
    expect(nonsenseSeeds).toBeGreaterThanOrEqual(15);
  });
});

describe("retrieval keyword trap (both locales)", () => {
  for (const [name, messages] of Object.entries(locales)) {
    const r = messages.experiments.retrieval;

    it(`${name}: the lost-phone note (doc3) wins, the meaning-correct note (doc2) scores zero`, () => {
      const scores = {
        doc1: scoreDoc(r.query, r.doc1Body),
        doc2: scoreDoc(r.query, r.doc2Body),
        doc3: scoreDoc(r.query, r.doc3Body),
      };
      expect(scores.doc3).toBeGreaterThan(scores.doc1);
      expect(scores.doc3).toBeGreaterThan(scores.doc2);
      expect(scores.doc3).toBeGreaterThanOrEqual(3);
      // the delta copy claims the right-by-meaning note gets zero matches
      expect(scores.doc2).toBe(0);
    });

    it(`${name}: query tokenization keeps the trap word`, () => {
      expect(tokenize(r.query).some((t) => t.startsWith("телефон"))).toBe(true);
    });
  }
});

describe("tokenizer language gap (both locales)", () => {
  for (const [name, messages] of Object.entries(locales)) {
    const t = messages.experiments.tokenizer;

    it(`${name}: local message is shorter in characters but costs more tokens`, () => {
      // same corpus + merge count as the component
      const merges = trainBPE(CORPUS, 200);
      const enChars = t.msgEn.replace(/\s+/g, "").length;
      const localChars = t.msgLocal.replace(/\s+/g, "").length;
      const enTokens = countTokens(t.msgEn, merges);
      const localTokens = countTokens(t.msgLocal, merges);

      expect(localChars).toBeLessThan(enChars);
      // the gap must be big enough to be the whole point of the reveal
      expect(localTokens).toBeGreaterThan(enTokens * 2);
    });
  }
});
