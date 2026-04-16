import { describe, it, expect } from "vitest";
import {
  forward,
  generateNetwork,
  type Network,
} from "@/components/experiments/NeuralNetworkPlayground";

describe("generateNetwork", () => {
  it("same seed produces identical network (determinism)", () => {
    const a = generateNetwork(42);
    const b = generateNetwork(42);

    expect(a.inputWeights).toEqual(b.inputWeights);
    expect(a.hiddenBias).toEqual(b.hiddenBias);
    expect(a.outputWeights).toEqual(b.outputWeights);
    expect(a.outputBias).toBe(b.outputBias);
  });
});

describe("forward", () => {
  it("disabled node has zero hidden activation", () => {
    const net = generateNetwork(7);
    const result = forward(net, [5, 3], new Set([1]));

    expect(result.hidden[1]).toBe(0);
  });

  it("disabling a node changes the output", () => {
    const net = generateNetwork(7);
    const full = forward(net, [5, 3], new Set());
    const partial = forward(net, [5, 3], new Set([1]));

    // Very unlikely to be equal with random weights
    expect(full.output).not.toBe(partial.output);
  });

  it("all nodes disabled → output equals rounded outputBias", () => {
    const net = generateNetwork(7);
    const result = forward(net, [5, 3], new Set([0, 1, 2]));

    expect(result.output).toBe(Math.round(net.outputBias * 100) / 100);
    expect(result.hidden).toEqual([0, 0, 0]);
  });

  it("ReLU clamps negative pre-activations to zero", () => {
    const net: Network = {
      inputWeights: [
        [-1, -1],
        [1, 1],
        [1, 1],
      ],
      hiddenBias: [-100, 0, 0],
      outputWeights: [1, 1, 1],
      outputBias: 0,
    };

    const result = forward(net, [1, 1], new Set());
    // node 0: -1 -1 -100 = -102, ReLU → 0
    expect(result.hidden[0]).toBe(0);
    // node 1: 1 + 1 + 0 = 2, ReLU → 2
    expect(result.hidden[1]).toBe(2);
  });
});
