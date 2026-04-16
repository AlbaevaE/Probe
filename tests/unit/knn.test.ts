import { describe, it, expect } from "vitest";
import { classify, type Point } from "@/components/experiments/KNNPlayground";

describe("classify (KNN)", () => {
  const redCluster: Point[] = [
    { x: 0, y: 0, cls: "red" },
    { x: 1, y: 0, cls: "red" },
    { x: 0, y: 1, cls: "red" },
  ];
  const blueCluster: Point[] = [
    { x: 10, y: 10, cls: "blue" },
    { x: 11, y: 10, cls: "blue" },
    { x: 10, y: 11, cls: "blue" },
  ];
  const allPoints = [...redCluster, ...blueCluster];

  it("classifies a point near red cluster as red", () => {
    expect(classify(allPoints, { x: 0.5, y: 0.5 }, 3)).toBe("red");
  });

  it("classifies a point near blue cluster as blue", () => {
    expect(classify(allPoints, { x: 10.5, y: 10.5 }, 3)).toBe("blue");
  });

  it("k=1 returns the nearest neighbor's class", () => {
    const points: Point[] = [
      { x: 0, y: 0, cls: "red" },
      { x: 2, y: 0, cls: "blue" },
    ];
    expect(classify(points, { x: 0.5, y: 0 }, 1)).toBe("red");
    expect(classify(points, { x: 1.8, y: 0 }, 1)).toBe("blue");
  });

  it("majority wins with mixed neighbors", () => {
    const points: Point[] = [
      { x: 0, y: 0, cls: "red" },
      { x: 1, y: 0, cls: "red" },
      { x: 2, y: 0, cls: "blue" },
    ];
    // Query at (0.5, 0), k=3: 2 red, 1 blue → red
    expect(classify(points, { x: 0.5, y: 0 }, 3)).toBe("red");
  });
});
