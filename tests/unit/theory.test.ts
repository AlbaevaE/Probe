import { describe, it, expect } from "vitest";
import ru from "@/messages/ru.json";
import ky from "@/messages/ky.json";

// Every experiment wired into the router must ship a theory block in both
// locales — the ExperimentShell reads it unconditionally.
const NAMESPACES = [
  "overfitting",
  "neuralNetwork",
  "knn",
  "gradientDescent",
  "dataBalance",
  "decisionBoundary",
  "llmPipeline",
  "hallucination",
  "promptInjection",
  "humanInTheLoop",
  "temperature",
  "retrieval",
  "tokenizer",
  "diceAverage",
  "galtonBoard",
  "birthdayParadox",
  "monteCarloPi",
  "earthRope",
  "areaScaling",
  "pendulum",
  "projectileAngle",
  "brakingDistance",
];

type Theory = {
  intro: string[];
  keyIdea: string;
  examples: { title: string; body: string }[];
};

const locales = { ru, ky } as const;

describe("theory blocks exist for every wired experiment", () => {
  for (const [name, messages] of Object.entries(locales)) {
    const experiments = messages.experiments as Record<string, unknown>;

    it(`${name}: theoryCommon labels present`, () => {
      const common = experiments.theoryCommon as Record<string, string>;
      expect(common.heading).toBeTruthy();
      expect(common.keyIdea).toBeTruthy();
      expect(common.examples).toBeTruthy();
    });

    it(`${name}: every namespace has intro, keyIdea and examples`, () => {
      for (const ns of NAMESPACES) {
        const exp = experiments[ns] as { theory?: Theory } | undefined;
        expect(exp, `${name}.${ns} missing`).toBeTruthy();
        const theory = exp!.theory;
        expect(theory, `${name}.${ns}.theory missing`).toBeTruthy();
        expect(Array.isArray(theory!.intro)).toBe(true);
        expect(theory!.intro.length).toBeGreaterThanOrEqual(2);
        expect(theory!.keyIdea.length).toBeGreaterThan(20);
        expect(theory!.examples.length).toBeGreaterThanOrEqual(2);
        for (const ex of theory!.examples) {
          expect(ex.title.length).toBeGreaterThan(2);
          expect(ex.body.length).toBeGreaterThan(20);
        }
      }
    });
  }
});
