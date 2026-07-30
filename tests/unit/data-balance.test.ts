import { describe, it, expect } from "vitest";
import {
  generateData,
  trainNaiveBayes,
  accuracy,
  TRAIN_MAJORITY,
  TRAIN_MINORITY,
  TEST_PER_GROUP,
} from "@/components/experiments/DataBalancePlayground";

// Seeds the learner can actually reach: the playground starts at 42 and each
// reshuffle bumps by one.
const SEEDS = Array.from({ length: 30 }, (_, i) => 42 + i);

function run(seed: number, majority = TRAIN_MAJORITY, minority = TRAIN_MINORITY) {
  const { train, test } = generateData(seed, majority, minority);
  const stats = trainNaiveBayes(train);
  return { a: accuracy(stats, test, "A"), b: accuracy(stats, test, "B"), stats };
}

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

describe("data balance: the test set is fair even though the training set is not", () => {
  it("trains on 90/10 and tests on 50/50", () => {
    const { train, test } = generateData(42);
    expect(train.filter((s) => s.label === "A")).toHaveLength(TRAIN_MAJORITY);
    expect(train.filter((s) => s.label === "B")).toHaveLength(TRAIN_MINORITY);
    expect(test.filter((s) => s.label === "A")).toHaveLength(TEST_PER_GROUP);
    expect(test.filter((s) => s.label === "B")).toHaveLength(TEST_PER_GROUP);
  });

  it("carries the imbalance into the class prior", () => {
    const { stats } = run(42);
    expect(stats.A.prior).toBeCloseTo(0.9, 5);
    expect(stats.B.prior).toBeCloseTo(0.1, 5);
  });
});

describe("data balance: the minority group pays for the imbalance", () => {
  it("is far more accurate on the majority group, on every reachable seed", () => {
    for (const seed of SEEDS) {
      const { a, b } = run(seed);
      expect(a - b, `seed ${seed}: A=${a} B=${b}`).toBeGreaterThanOrEqual(20);
    }
  });

  it("keeps the majority group near-perfect", () => {
    const majority = SEEDS.map((seed) => run(seed).a);
    expect(Math.min(...majority)).toBeGreaterThanOrEqual(80);
  });
});

describe("data balance: the data is to blame, not the groups", () => {
  // The point of the experiment: goats are no harder to recognise than sheep.
  // Same distributions, same classifier — only the training counts change.
  it("recovers minority accuracy when the training set is balanced", () => {
    const imbalanced = mean(SEEDS.map((seed) => run(seed).b));
    const balanced = mean(SEEDS.map((seed) => run(seed, 20, 20).b));
    expect(imbalanced).toBeLessThan(55);
    expect(balanced).toBeGreaterThan(imbalanced + 30);
  });

  it("does not simply answer with the majority label every time", () => {
    // A model that always said "A" would score exactly 0 on the minority.
    const anyMinorityCorrect = SEEDS.some((seed) => run(seed).b > 0);
    expect(anyMinorityCorrect).toBe(true);
  });
});
