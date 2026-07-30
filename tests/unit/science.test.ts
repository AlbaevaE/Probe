import { describe, it, expect } from "vitest";
import {
  simulateBins,
  BALLS,
  ROWS,
} from "@/components/experiments/GaltonBoardPlayground";
import {
  generatePoints,
  estimatePi,
  TOTAL_POINTS,
} from "@/components/experiments/MonteCarloPiPlayground";
import {
  simulatePendulum,
  crossingTimes,
  LENGTH,
  THETA0,
} from "@/components/experiments/PendulumPlayground";
import {
  simulateRolls,
  runningMeans,
  ROLLS,
} from "@/components/experiments/DiceAveragePlayground";
import {
  simulateClasses,
  exactProbability,
  CLASSES,
  CLASS_SIZE,
} from "@/components/experiments/BirthdayParadoxPlayground";
import { ropeGap, gapFromRadii } from "@/components/experiments/EarthRopePlayground";
import {
  cellCenters,
  CELL_CM,
  SMALL_R_CM,
  BIG_R_CM,
} from "@/components/experiments/AreaScalingPlayground";
import { simulateProjectile, V0 } from "@/components/experiments/ProjectileAnglePlayground";
import {
  brakingDistance,
  DECEL,
  V_SLOW,
  V_FAST,
} from "@/components/experiments/BrakingDistancePlayground";
import { mulberry32 } from "@/lib/rng";

describe("galton board: the pile is a bell, not a plateau", () => {
  it("middle bins dominate edge bins on every reshuffle", () => {
    for (let seed = 11; seed < 31; seed++) {
      const bins = simulateBins(BALLS, ROWS, mulberry32(seed));
      const middle = bins[3] + bins[4] + bins[5];
      const edges = bins[0] + bins[1] + bins[7] + bins[8];
      // expectation: middle ≈ 45.5 of 64, edges ≈ 4.5 of 64
      expect(middle).toBeGreaterThan(edges * 3);
    }
  });

  it("the mean bin stays near the center", () => {
    for (let seed = 11; seed < 31; seed++) {
      const bins = simulateBins(BALLS, ROWS, mulberry32(seed));
      const total = bins.reduce((a, b) => a + b, 0);
      const mean = bins.reduce((a, b, i) => a + b * i, 0) / total;
      expect(total).toBe(BALLS);
      expect(Math.abs(mean - ROWS / 2)).toBeLessThan(0.8);
    }
  });
});

describe("monte carlo: 2000 random points measure π", () => {
  it("share × 4 lands near π on every reshuffle", () => {
    for (let seed = 3; seed < 23; seed++) {
      const points = generatePoints(TOTAL_POINTS, mulberry32(seed));
      // std of the estimator is ≈ 0.037 at n=2000; 0.15 is a 4σ corridor
      expect(Math.abs(estimatePi(points) - Math.PI)).toBeLessThan(0.15);
    }
  });

  it("the share matches the delta copy's 78.5% claim", () => {
    const points = generatePoints(TOTAL_POINTS, mulberry32(3));
    const share = points.filter((p) => p.inside).length / points.length;
    expect(share).toBeGreaterThan(0.74);
    expect(share).toBeLessThan(0.83);
  });
});

describe("pendulum: mass cancels out of the motion", () => {
  const dt = 1 / 240;
  const steps = Math.round(6.5 / dt);

  it("a 1 kg and a 5 kg bob trace identical trajectories", () => {
    const light = simulatePendulum(1, LENGTH, THETA0, dt, steps);
    const heavy = simulatePendulum(5, LENGTH, THETA0, dt, steps);
    expect(light.length).toBe(heavy.length);
    for (let i = 0; i < light.length; i++) {
      expect(Math.abs(light[i] - heavy[i])).toBeLessThan(1e-12);
    }
  });

  it("the measured period matches T = 2π√(L/g) within the large-angle correction", () => {
    const series = simulatePendulum(1, LENGTH, THETA0, dt, steps);
    const crossings = crossingTimes(series, dt);
    expect(crossings.length).toBeGreaterThanOrEqual(3);
    const measured = crossings[2] - crossings[0];
    const smallAngle = 2 * Math.PI * Math.sqrt(LENGTH / 9.81);
    // 35° amplitude runs ≈ 2.4% slow vs the small-angle formula
    expect(measured).toBeGreaterThan(smallAngle);
    expect(measured).toBeLessThan(smallAngle * 1.05);
  });
});

describe("dice average: the law of large numbers tames the rolls", () => {
  it("the running mean ends near 3.5 on every reshuffle", () => {
    for (let seed = 5; seed < 25; seed++) {
      const means = runningMeans(simulateRolls(ROLLS, mulberry32(seed)));
      // std of the mean of 300 rolls ≈ 0.099; 0.4 is a 4σ corridor
      expect(Math.abs(means[ROLLS - 1] - 3.5)).toBeLessThan(0.4);
    }
  });

  it("early means scatter more than late means", () => {
    let early = 0;
    let late = 0;
    for (let seed = 5; seed < 25; seed++) {
      const means = runningMeans(simulateRolls(ROLLS, mulberry32(seed)));
      early += Math.abs(means[9] - 3.5);
      late += Math.abs(means[ROLLS - 1] - 3.5);
    }
    expect(early).toBeGreaterThan(late * 2);
  });
});

describe("birthday paradox: about half of the classes share a birthday", () => {
  it("the analytic probability crosses 50% exactly at 23 people", () => {
    expect(exactProbability(22)).toBeLessThan(0.5);
    expect(exactProbability(23)).toBeGreaterThan(0.5);
    expect(exactProbability(CLASS_SIZE)).toBeCloseTo(0.5073, 3);
  });

  it("the simulated share stays near 50.7% on every reshuffle", () => {
    for (let seed = 17; seed < 37; seed++) {
      const classes = simulateClasses(CLASSES, CLASS_SIZE, mulberry32(seed));
      const share = classes.filter(Boolean).length / CLASSES;
      // std ≈ 0.05 at n=100; 0.2 is a 4σ corridor
      expect(Math.abs(share - 0.507)).toBeLessThan(0.2);
    }
  });

  it("a large run converges to the analytic value", () => {
    const classes = simulateClasses(5000, CLASS_SIZE, mulberry32(17));
    const share = classes.filter(Boolean).length / classes.length;
    // std ≈ 0.007 at n=5000; 0.03 is a >4σ corridor
    expect(Math.abs(share - exactProbability(CLASS_SIZE))).toBeLessThan(0.03);
  });
});

describe("earth rope: the gap does not depend on the radius", () => {
  it("one added metre lifts the rope ≈ 15.9 cm", () => {
    expect(ropeGap(1)).toBeCloseTo(1 / (2 * Math.PI), 9);
    expect(ropeGap(1) * 100).toBeGreaterThan(15.9);
    expect(ropeGap(1) * 100).toBeLessThan(16);
  });

  it("Earth and a football get the same gap", () => {
    const earth = gapFromRadii(6371000, 1);
    const ball = gapFromRadii(0.11, 1);
    expect(Math.abs(earth - ball)).toBeLessThan(1e-6);
  });
});

describe("area scaling: double diameter, four times the cells", () => {
  it("the cell count ratio is ≈ 4", () => {
    const small = cellCenters(SMALL_R_CM, CELL_CM).length;
    const big = cellCenters(BIG_R_CM, CELL_CM).length;
    const ratio = big / small;
    expect(ratio).toBeGreaterThan(3.7);
    expect(ratio).toBeLessThan(4.3);
  });

  it("cell counts approximate the circle areas", () => {
    for (const r of [SMALL_R_CM, BIG_R_CM]) {
      const count = cellCenters(r, CELL_CM).length;
      const expected = (Math.PI * r * r) / (CELL_CM * CELL_CM);
      expect(Math.abs(count - expected) / expected).toBeLessThan(0.1);
    }
  });
});

describe("projectile: 45° wins, 30° and 60° tie", () => {
  const dt = 1 / 240;
  const r30 = simulateProjectile(30, V0, dt);
  const r45 = simulateProjectile(45, V0, dt);
  const r60 = simulateProjectile(60, V0, dt);

  it("45° flies farthest", () => {
    expect(r45.range).toBeGreaterThan(r30.range);
    expect(r45.range).toBeGreaterThan(r60.range);
  });

  it("complementary angles land in the same spot", () => {
    expect(Math.abs(r30.range - r60.range) / r45.range).toBeLessThan(0.01);
  });

  it("the 45° range matches v²/g", () => {
    const analytic = (V0 * V0) / 9.81;
    expect(Math.abs(r45.range - analytic) / analytic).toBeLessThan(0.015);
  });

  it("60° flies higher and longer than 30°", () => {
    expect(r60.apex).toBeGreaterThan(r30.apex);
    expect(r60.time).toBeGreaterThan(r30.time);
  });
});

describe("braking: double the speed, four times the distance", () => {
  const dt = 1 / 240;
  const slow = brakingDistance(V_SLOW, DECEL, dt);
  const fast = brakingDistance(V_FAST, DECEL, dt);

  it("the measured ratio is ≈ 4", () => {
    expect(fast / slow).toBeGreaterThan(3.9);
    expect(fast / slow).toBeLessThan(4.1);
  });

  it("distances match v²/2a", () => {
    expect(Math.abs(slow - (V_SLOW * V_SLOW) / (2 * DECEL)) / slow).toBeLessThan(0.02);
    expect(Math.abs(fast - (V_FAST * V_FAST) / (2 * DECEL)) / fast).toBeLessThan(0.02);
  });
});
