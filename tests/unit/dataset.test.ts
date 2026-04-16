import { describe, it, expect } from "vitest";
import { generateHousingDataset } from "@/lib/dataset";

describe("generateHousingDataset", () => {
  it("same seed produces identical output (determinism)", () => {
    const a = generateHousingDataset(42);
    const b = generateHousingDataset(42);

    expect(a.train.xs).toEqual(b.train.xs);
    expect(a.train.ys).toEqual(b.train.ys);
    expect(a.test.xs).toEqual(b.test.xs);
    expect(a.test.ys).toEqual(b.test.ys);
  });

  it("different seeds produce different output", () => {
    const a = generateHousingDataset(42);
    const b = generateHousingDataset(43);

    expect(a.train.ys).not.toEqual(b.train.ys);
  });

  it("returns correct number of points", () => {
    const { train, test } = generateHousingDataset(1);

    expect(train.xs).toHaveLength(10);
    expect(train.ys).toHaveLength(10);
    expect(test.xs).toHaveLength(10);
    expect(test.ys).toHaveLength(10);
  });

  it("xs and ys have matching lengths", () => {
    const { train, test } = generateHousingDataset(99);

    expect(train.xs.length).toBe(train.ys.length);
    expect(test.xs.length).toBe(test.ys.length);
  });

  it("test xs are sorted ascending", () => {
    const { test } = generateHousingDataset(42);

    for (let i = 1; i < test.xs.length; i++) {
      expect(test.xs[i]).toBeGreaterThanOrEqual(test.xs[i - 1]);
    }
  });
});
