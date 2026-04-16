import { describe, it, expect } from "vitest";
import { fitPolynomial, meanAbsoluteError } from "@/lib/fit";

describe("fitPolynomial", () => {
  it("linear fit on linear data has near-zero error", () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = [0, 2, 4, 6, 8]; // y = 2x
    const model = fitPolynomial(xs, ys, 1);

    expect(model.predict(2.5)).toBeCloseTo(5.0, 1);
    expect(meanAbsoluteError(model, xs, ys)).toBeLessThan(0.01);
  });

  it("quadratic fit on quadratic data", () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = [0, 1, 4, 9, 16]; // y = x^2
    const model = fitPolynomial(xs, ys, 2);

    expect(model.predict(2.5)).toBeCloseTo(6.25, 0);
    expect(meanAbsoluteError(model, xs, ys)).toBeLessThan(0.5);
  });

  it("stores the correct degree", () => {
    const model = fitPolynomial([0, 1, 2], [0, 1, 2], 3);
    expect(model.degree).toBe(3);
  });
});

describe("meanAbsoluteError", () => {
  it("computes correctly with known values", () => {
    // Model that always predicts 10
    const constant10 = fitPolynomial([0, 1], [10, 10], 0);
    const mae = meanAbsoluteError(constant10, [0, 1, 2], [8, 10, 12]);
    // |10-8| + |10-10| + |10-12| = 2 + 0 + 2 = 4, /3 ≈ 1.333
    expect(mae).toBeCloseTo(4 / 3, 1);
  });

  it("returns zero when model is perfect", () => {
    const xs = [0, 1, 2, 3, 4];
    const ys = [0, 2, 4, 6, 8];
    const model = fitPolynomial(xs, ys, 1);
    expect(meanAbsoluteError(model, xs, ys)).toBeLessThan(0.001);
  });
});
