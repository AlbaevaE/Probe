import type { ReactNode } from "react";
import { AiMlVenn } from "./AiMlVenn";
import { ScatterFit } from "./ScatterFit";
import { OverfitPlot } from "./OverfitPlot";
import { NeuralNet } from "./NeuralNet";
import { TokenProbs } from "./TokenProbs";

const VISUALS: Record<string, () => ReactNode> = {
  "ai-ml-venn": AiMlVenn,
  "scatter-fit": ScatterFit,
  "overfit-plot": OverfitPlot,
  "neural-net": NeuralNet,
  "token-probs": TokenProbs,
};

export function renderVisual(key: string | undefined): ReactNode {
  if (!key) return null;
  const C = VISUALS[key];
  if (!C) return null;
  return <C />;
}
