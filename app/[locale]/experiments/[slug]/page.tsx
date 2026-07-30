import { notFound } from "next/navigation";
import { ExperimentShell } from "@/components/ExperimentShell";
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
import { TemperaturePlayground } from "@/components/experiments/TemperaturePlayground";
import { RetrievalPlayground } from "@/components/experiments/RetrievalPlayground";
import { TokenizerPlayground } from "@/components/experiments/TokenizerPlayground";
import { GaltonBoardPlayground } from "@/components/experiments/GaltonBoardPlayground";
import { MonteCarloPiPlayground } from "@/components/experiments/MonteCarloPiPlayground";
import { PendulumPlayground } from "@/components/experiments/PendulumPlayground";
import { DiceAveragePlayground } from "@/components/experiments/DiceAveragePlayground";
import { BirthdayParadoxPlayground } from "@/components/experiments/BirthdayParadoxPlayground";
import { EarthRopePlayground } from "@/components/experiments/EarthRopePlayground";
import { AreaScalingPlayground } from "@/components/experiments/AreaScalingPlayground";
import { ProjectileAnglePlayground } from "@/components/experiments/ProjectileAnglePlayground";
import { BrakingDistancePlayground } from "@/components/experiments/BrakingDistancePlayground";

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
  "temperature",
  "retrieval",
  "tokenizer",
  "galton-board",
  "monte-carlo-pi",
  "pendulum",
  "dice-average",
  "birthday-paradox",
  "earth-rope",
  "area-scaling",
  "projectile-angle",
  "braking-distance",
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
      <ExperimentShell slug={slug}>
        <OverfittingPlayground labels={labels} />
      </ExperimentShell>
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
      <ExperimentShell slug={slug}>
        <NeuralNetworkPlayground labels={labels} />
      </ExperimentShell>
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
      <ExperimentShell slug={slug}>
        <KNNPlayground labels={labels} />
      </ExperimentShell>
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
      <ExperimentShell slug={slug}>
        <GradientDescentPlayground labels={labels} />
      </ExperimentShell>
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
      iconA: t("iconA"),
      iconB: t("iconB"),
      accuracyLabel: t("accuracyLabel"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <DataBalancePlayground labels={labels} />
      </ExperimentShell>
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
      <ExperimentShell slug={slug}>
        <DecisionBoundaryPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "llm-pipeline") {
    const t = await getTranslations("experiments.llmPipeline");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      samples: t.raw("samples") as { input: string; output: string }[],
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
      <ExperimentShell slug={slug}>
        <LLMPipelinePlayground labels={labels} />
      </ExperimentShell>
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
      <ExperimentShell slug={slug}>
        <HallucinationPlayground labels={labels} />
      </ExperimentShell>
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
      <ExperimentShell slug={slug}>
        <PromptInjectionPlayground labels={labels} />
      </ExperimentShell>
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
      <ExperimentShell slug={slug}>
        <HumanInTheLoopPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "temperature") {
    const t = await getTranslations("experiments.temperature");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      recordedNote: t("recordedNote"),
      contextLabel: t("contextLabel"),
      contextSentence: t("contextSentence"),
      word1: t("word1"),
      word2: t("word2"),
      word3: t("word3"),
      word4: t("word4"),
      word5: t("word5"),
      word6: t("word6"),
      prediction: t("prediction"),
      optPrecise: t("optPrecise"),
      optCreative: t("optCreative"),
      optRandom: t("optRandom"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      samplesNote: t("samplesNote"),
      tempLabel: t("tempLabel"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaAlmostTitle: t("deltaAlmostTitle"),
      deltaAlmostBody: t("deltaAlmostBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <TemperaturePlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "retrieval") {
    const t = await getTranslations("experiments.retrieval");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      kbHeading: t("kbHeading"),
      doc1Title: t("doc1Title"),
      doc1Body: t("doc1Body"),
      doc2Title: t("doc2Title"),
      doc2Body: t("doc2Body"),
      doc3Title: t("doc3Title"),
      doc3Body: t("doc3Body"),
      queryLabel: t("queryLabel"),
      query: t("query"),
      prediction: t("prediction"),
      optDoc1: t("optDoc1"),
      optDoc2: t("optDoc2"),
      optDoc3: t("optDoc3"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      matchesLabel: t("matchesLabel"),
      pickedLabel: t("pickedLabel"),
      assistantAnswerLabel: t("assistantAnswerLabel"),
      assistantAnswer: t("assistantAnswer"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaMeaningTitle: t("deltaMeaningTitle"),
      deltaMeaningBody: t("deltaMeaningBody"),
      deltaWrongTitle: t("deltaWrongTitle"),
      deltaWrongBody: t("deltaWrongBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <RetrievalPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "tokenizer") {
    const t = await getTranslations("experiments.tokenizer");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      trainNote: t("trainNote"),
      msgEnHeading: t("msgEnHeading"),
      msgLocalHeading: t("msgLocalHeading"),
      msgEn: t("msgEn"),
      msgLocal: t("msgLocal"),
      charsLabel: t("charsLabel"),
      tokensLabel: t("tokensLabel"),
      prediction: t("prediction"),
      optEn: t("optEn"),
      optLocal: t("optLocal"),
      optEqual: t("optEqual"),
      run: t("run"),
      runHint: t("runHint"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWrongEnTitle: t("deltaWrongEnTitle"),
      deltaWrongEnBody: t("deltaWrongEnBody"),
      deltaWrongEqualTitle: t("deltaWrongEqualTitle"),
      deltaWrongEqualBody: t("deltaWrongEqualBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <TokenizerPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "galton-board") {
    const t = await getTranslations("experiments.galtonBoard");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optFlat: t("optFlat"),
      optBell: t("optBell"),
      optEdges: t("optEdges"),
      run: t("run"),
      runHint: t("runHint"),
      ballsLabel: t("ballsLabel"),
      resultsHeading: t("resultsHeading"),
      pathsNote: t("pathsNote"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaFlatTitle: t("deltaFlatTitle"),
      deltaFlatBody: t("deltaFlatBody"),
      deltaEdgesTitle: t("deltaEdgesTitle"),
      deltaEdgesBody: t("deltaEdgesBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <GaltonBoardPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "monte-carlo-pi") {
    const t = await getTranslations("experiments.monteCarloPi");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optHalf: t("optHalf"),
      optMost: t("optMost"),
      optAll: t("optAll"),
      run: t("run"),
      runHint: t("runHint"),
      totalLabel: t("totalLabel"),
      insideLabel: t("insideLabel"),
      shareLabel: t("shareLabel"),
      estimateLabel: t("estimateLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaHalfTitle: t("deltaHalfTitle"),
      deltaHalfBody: t("deltaHalfBody"),
      deltaAllTitle: t("deltaAllTitle"),
      deltaAllBody: t("deltaAllBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <MonteCarloPiPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "pendulum") {
    const t = await getTranslations("experiments.pendulum");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optHeavy: t("optHeavy"),
      optLight: t("optLight"),
      optSame: t("optSame"),
      run: t("run"),
      runHint: t("runHint"),
      lightLabel: t("lightLabel"),
      heavyLabel: t("heavyLabel"),
      swingsLabel: t("swingsLabel"),
      timeLabel: t("timeLabel"),
      periodLabel: t("periodLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaHeavyTitle: t("deltaHeavyTitle"),
      deltaHeavyBody: t("deltaHeavyBody"),
      deltaLightTitle: t("deltaLightTitle"),
      deltaLightBody: t("deltaLightBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <PendulumPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "dice-average") {
    const t = await getTranslations("experiments.diceAverage");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optWander: t("optWander"),
      optSettle: t("optSettle"),
      optHot: t("optHot"),
      run: t("run"),
      runHint: t("runHint"),
      rollsLabel: t("rollsLabel"),
      lastRollLabel: t("lastRollLabel"),
      meanLabel: t("meanLabel"),
      first10Label: t("first10Label"),
      finalLabel: t("finalLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaWanderTitle: t("deltaWanderTitle"),
      deltaWanderBody: t("deltaWanderBody"),
      deltaHotTitle: t("deltaHotTitle"),
      deltaHotBody: t("deltaHotBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <DiceAveragePlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "birthday-paradox") {
    const t = await getTranslations("experiments.birthdayParadox");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optRare: t("optRare"),
      optHalf: t("optHalf"),
      optAlways: t("optAlways"),
      run: t("run"),
      runHint: t("runHint"),
      classesLabel: t("classesLabel"),
      matchLabel: t("matchLabel"),
      legendMatch: t("legendMatch"),
      legendNone: t("legendNone"),
      classLabel: t("classLabel"),
      yearLabel: t("yearLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaRareTitle: t("deltaRareTitle"),
      deltaRareBody: t("deltaRareBody"),
      deltaAlwaysTitle: t("deltaAlwaysTitle"),
      deltaAlwaysBody: t("deltaAlwaysBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <BirthdayParadoxPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "earth-rope") {
    const t = await getTranslations("experiments.earthRope");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      scaleNote: t("scaleNote"),
      prediction: t("prediction"),
      optHair: t("optHair"),
      optCat: t("optCat"),
      optHouse: t("optHouse"),
      run: t("run"),
      runHint: t("runHint"),
      earthLabel: t("earthLabel"),
      ballLabel: t("ballLabel"),
      addedLabel: t("addedLabel"),
      gapLabel: t("gapLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaHairTitle: t("deltaHairTitle"),
      deltaHairBody: t("deltaHairBody"),
      deltaHouseTitle: t("deltaHouseTitle"),
      deltaHouseBody: t("deltaHouseBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <EarthRopePlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "area-scaling") {
    const t = await getTranslations("experiments.areaScaling");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optTwo: t("optTwo"),
      optThree: t("optThree"),
      optFour: t("optFour"),
      run: t("run"),
      runHint: t("runHint"),
      smallLabel: t("smallLabel"),
      bigLabel: t("bigLabel"),
      cellsLabel: t("cellsLabel"),
      ratioLabel: t("ratioLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaTwoTitle: t("deltaTwoTitle"),
      deltaTwoBody: t("deltaTwoBody"),
      deltaThreeTitle: t("deltaThreeTitle"),
      deltaThreeBody: t("deltaThreeBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <AreaScalingPlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "projectile-angle") {
    const t = await getTranslations("experiments.projectileAngle");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      opt30: t("opt30"),
      opt45: t("opt45"),
      opt60: t("opt60"),
      run: t("run"),
      runHint: t("runHint"),
      rangeLabel: t("rangeLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      delta30Title: t("delta30Title"),
      delta30Body: t("delta30Body"),
      delta60Title: t("delta60Title"),
      delta60Body: t("delta60Body"),
    };
    return (
      <ExperimentShell slug={slug}>
        <ProjectileAnglePlayground labels={labels} />
      </ExperimentShell>
    );
  }

  if (slug === "braking-distance") {
    const t = await getTranslations("experiments.brakingDistance");
    const labels = {
      label: t("label"),
      title: t("title"),
      situation: t("situation"),
      prediction: t("prediction"),
      optTwo: t("optTwo"),
      optThree: t("optThree"),
      optFour: t("optFour"),
      run: t("run"),
      runHint: t("runHint"),
      slowLabel: t("slowLabel"),
      fastLabel: t("fastLabel"),
      distanceLabel: t("distanceLabel"),
      ratioLabel: t("ratioLabel"),
      resultsHeading: t("resultsHeading"),
      reshuffle: t("reshuffle"),
      deltaRightTitle: t("deltaRightTitle"),
      deltaRightBody: t("deltaRightBody"),
      deltaTwoTitle: t("deltaTwoTitle"),
      deltaTwoBody: t("deltaTwoBody"),
      deltaThreeTitle: t("deltaThreeTitle"),
      deltaThreeBody: t("deltaThreeBody"),
    };
    return (
      <ExperimentShell slug={slug}>
        <BrakingDistancePlayground labels={labels} />
      </ExperimentShell>
    );
  }

  notFound();
}
