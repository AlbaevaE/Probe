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
import { PromptInjectionPlayground } from "@/components/experiments/PromptInjectionPlayground";
import { HumanInTheLoopPlayground } from "@/components/experiments/HumanInTheLoopPlayground";

const SLUGS = [
  "overfitting",
  "neural-network",
  "knn",
  "gradient-descent",
  "data-balance",
  "decision-boundary",
  "llm-pipeline",
  "hallucination",
  "prompt-injection",
  "human-in-the-loop",
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
      recordedNote: t("recordedNote"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <HallucinationPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "prompt-injection") {
    const t = await getTranslations("experiments.promptInjection");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      inboxHeading: t("inboxHeading"),
      assistantInstruction: t("assistantInstruction"),
      email1From: t("email1From"),
      email1Subject: t("email1Subject"),
      email1Body: t("email1Body"),
      email2From: t("email2From"),
      email2Subject: t("email2Subject"),
      email2Body: t("email2Body"),
      email3From: t("email3From"),
      email3Subject: t("email3Subject"),
      email3Body: t("email3Body"),
      prediction: t("prediction"),
      optNone: t("optNone"),
      optEmail1: t("optEmail1"),
      optEmail2: t("optEmail2"),
      optEmail3: t("optEmail3"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      assistantDid: t("assistantDid"),
      actionSummarize: t("actionSummarize"),
      actionForward: t("actionForward"),
      actionDelete: t("actionDelete"),
      hijackedMark: t("hijackedMark"),
      yourPick: t("yourPick"),
      truth: t("truth"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <PromptInjectionPlayground labels={labels} />
      </div>
    );
  }

  if (slug === "human-in-the-loop") {
    const t = await getTranslations("experiments.humanInTheLoop");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optSolo: t("optSolo"),
      optHuman: t("optHuman"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      case1: t("case1"),
      case2: t("case2"),
      case3: t("case3"),
      case4: t("case4"),
      case5: t("case5"),
      stakesLabel: t("stakesLabel"),
      stakesLow: t("stakesLow"),
      stakesHigh: t("stakesHigh"),
      rubricHeading: t("rubricHeading"),
      rubricBody: t("rubricBody"),
      agreeLabel: t("agreeLabel"),
      disagreeLabel: t("disagreeLabel"),
      scoreLabel: t("scoreLabel"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <HumanInTheLoopPlayground labels={labels} />
      </div>
    );
  }

  notFound();
}
