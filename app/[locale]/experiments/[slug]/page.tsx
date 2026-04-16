import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { OverfittingPlayground } from "@/components/experiments/OverfittingPlayground";
import { NeuralNetworkPlayground } from "@/components/experiments/NeuralNetworkPlayground";
import { KNNPlayground } from "@/components/experiments/KNNPlayground";
import { GradientDescentPlayground } from "@/components/experiments/GradientDescentPlayground";
import { DataBalancePlayground } from "@/components/experiments/DataBalancePlayground";
import { DecisionBoundaryPlayground } from "@/components/experiments/DecisionBoundaryPlayground";
import { LLMPipelinePlayground } from "@/components/experiments/LLMPipelinePlayground";
import { HallucinationPlayground } from "@/components/experiments/HallucinationPlayground";
import { AISafetyPlayground } from "@/components/experiments/AISafetyPlayground";

const SLUGS = [
  "overfitting",
  "neural-network",
  "knn",
  "gradient-descent",
  "data-balance",
  "decision-boundary",
  "llm-pipeline",
  "hallucination",
  "ai-safety",
] as const;

type Slug = (typeof SLUGS)[number];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

async function overfittingLabels(t: Awaited<ReturnType<typeof getTranslations<"experiments.overfitting">>>) {
  return {
    label: t("label"),
    title: t("title"),
    situation: t("situation"),
    axesArea: t("axes.area"),
    axesPrice: t("axes.price"),
    trainMark: t("axes.trainMark"),
    testMark: t("axes.testMark"),
    prediction: t("prediction"),
    optLinear: t("options.linear.title"),
    optLinearHint: t("options.linear.hint"),
    optQuadratic: t("options.quadratic.title"),
    optQuadraticHint: t("options.quadratic.hint"),
    optPoly9: t("options.poly9.title"),
    optPoly9Hint: t("options.poly9.hint"),
    run: t("run"),
    runHint: t("runHint"),
    resultsHeading: t("resultsHeading"),
    errorOnTrain: t("errorOnTrain"),
    errorOnTest: t("errorOnTest"),
    yourPick: t("yourPick"),
    winner: t("winner"),
    reshuffle: t("reshuffle"),
    deltaRightTitle: t("delta.right.title"),
    deltaRightBody: t("delta.right.body"),
    deltaWrongTitle: t("delta.wrong.title"),
    deltaWrongBody: t("delta.wrong.body"),
    deltaAlmostTitle: t("delta.almost.title"),
    deltaAlmostBody: t("delta.almost.body"),
  };
}

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  if (!SLUGS.includes(slug as Slug)) notFound();
  setRequestLocale(locale);

  if (slug === "overfitting") {
    const t = await getTranslations("experiments.overfitting");
    const labels = await overfittingLabels(t);
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <OverfittingPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "neural-network") {
    const t = await getTranslations("experiments.neuralNetwork");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optUp: t("optUp"),
      optDown: t("optDown"),
      optSame: t("optSame"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      toggleHint: t("toggleHint"),
      inputLabel: t("inputLabel"),
      outputLabel: t("outputLabel"),
      hiddenLabel: t("hiddenLabel"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <NeuralNetworkPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "knn") {
    const t = await getTranslations("experiments.knn");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optRed: t("optRed"),
      optBlue: t("optBlue"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      kLabel: t("kLabel"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <KNNPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "gradient-descent") {
    const t = await getTranslations("experiments.gradientDescent");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optGlobal: t("optGlobal"),
      optLocal: t("optLocal"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      clickHint: t("clickHint"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <GradientDescentPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "data-balance") {
    const t = await getTranslations("experiments.dataBalance");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optYes: t("optYes"),
      optNo: t("optNo"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      groupA: t("groupA"),
      groupB: t("groupB"),
      accuracyLabel: t("accuracyLabel"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <DataBalancePlayground labels={labels} />
      </div>
    );
  }

  if (slug === "decision-boundary") {
    const t = await getTranslations("experiments.decisionBoundary");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optVertical: t("optVertical"),
      optHorizontal: t("optHorizontal"),
      optDiagonal: t("optDiagonal"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      accuracyLabel: t("accuracyLabel"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
      deltaAlmostTitle: t("deltaAlmostTitle"),
      deltaAlmostBody: t("deltaAlmostBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <DecisionBoundaryPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "llm-pipeline") {
    const t = await getTranslations("experiments.llmPipeline");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optOnce: t("optOnce"),
      optOnceHint: t("optOnceHint"),
      optPerWord: t("optPerWord"),
      optPerWordHint: t("optPerWordHint"),
      optPerToken: t("optPerToken"),
      optPerTokenHint: t("optPerTokenHint"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      stageInput: t("stageInput"),
      stageInputDesc: t("stageInputDesc"),
      stageTokenizer: t("stageTokenizer"),
      stageTokenizerDesc: t("stageTokenizerDesc"),
      stageEmbedding: t("stageEmbedding"),
      stageEmbeddingDesc: t("stageEmbeddingDesc"),
      stageAttention: t("stageAttention"),
      stageAttentionDesc: t("stageAttentionDesc"),
      stageGeneration: t("stageGeneration"),
      stageGenerationDesc: t("stageGenerationDesc"),
      stageCost: t("stageCost"),
      stageCostDesc: t("stageCostDesc"),
      next: t("next"),
      prev: t("prev"),
      inputTokens: t("inputTokens"),
      outputTokens: t("outputTokens"),
      totalPasses: t("totalPasses"),
      costEstimate: t("costEstimate"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <LLMPipelinePlayground labels={labels} />
      </div>
    );
  }

  if (slug === "hallucination") {
    const t = await getTranslations("experiments.hallucination");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optCorrect: t("optCorrect"),
      optWrong: t("optWrong"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      probabilityLabel: t("probabilityLabel"),
      modelPicks: t("modelPicks"),
      correctAnswer: t("correctAnswer"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
      whatToDo: t("whatToDo"),
      tipsList: t("tipsList"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <HallucinationPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "ai-safety") {
    const t = await getTranslations("experiments.aiSafety");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optSafe: t("optSafe"),
      optRisky: t("optRisky"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      scenario1: t("scenario1"),
      scenario1Answer: t("scenario1Answer"),
      scenario1Why: t("scenario1Why"),
      scenario2: t("scenario2"),
      scenario2Answer: t("scenario2Answer"),
      scenario2Why: t("scenario2Why"),
      scenario3: t("scenario3"),
      scenario3Answer: t("scenario3Answer"),
      scenario3Why: t("scenario3Why"),
      scenario4: t("scenario4"),
      scenario4Answer: t("scenario4Answer"),
      scenario4Why: t("scenario4Why"),
      scenario5: t("scenario5"),
      scenario5Answer: t("scenario5Answer"),
      scenario5Why: t("scenario5Why"),
      scoreLabel: t("scoreLabel"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <AISafetyPlayground labels={labels} />
      </div>
    );
  }

  notFound();
}
