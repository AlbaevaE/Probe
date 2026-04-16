import { describe, it, expect } from "vitest";
import {
  landscape,
  landscapeDerivative,
  findGlobalMin,
} from "@/components/experiments/GradientDescentPlayground";

describe("landscape", () => {
  it("returns finite numbers for inputs in [0, 6]", () => {
    for (const x of [0, 1, 2, 3, 4, 5, 6]) {
      expect(Number.isFinite(landscape(x))).toBe(true);
    }
  });

  it("matches a known value at x=0", () => {
    // landscape(0) = 0.5*sin(0) + 0.3*sin(1) + 0 - 0 + 2
    //             = 0 + 0.3*0.8414709848 + 2 ≈ 2.2524
    expect(landscape(0)).toBeCloseTo(2.2524, 2);
  });
});

describe("landscapeDerivative", () => {
  it("matches numerical derivative", () => {
    const x = 2;
    const h = 0.0001;
    const numerical = (landscape(x + h) - landscape(x - h)) / (2 * h);
    expect(landscapeDerivative(x)).toBeCloseTo(numerical, 2);
  });

  it("matches numerical derivative at multiple points", () => {
    for (const x of [0.5, 1.5, 3.0, 4.5]) {
      const h = 0.0001;
      const numerical = (landscape(x + h) - landscape(x - h)) / (2 * h);
      expect(landscapeDerivative(x)).toBeCloseTo(numerical, 2);
    }
  });
});

describe("findGlobalMin", () => {
  it("returns a value in [0, 6]", () => {
    const xMin = findGlobalMin();
    expect(xMin).toBeGreaterThanOrEqual(0);
    expect(xMin).toBeLessThanOrEqual(6);
  });

  it("the value at global min is actually minimal", () => {
    const xMin = findGlobalMin();
    const yMin = landscape(xMin);

    // Sample 100 points and verify none are lower
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 6;
      expect(landscape(x)).toBeGreaterThanOrEqual(yMin - 0.02);
    }
  });
});
