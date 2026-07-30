# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project direction — read first

This project has pivoted. What's live today is **not** the lesson-based course the original scaffolding was built for.

**Old model (still in the repo but orphaned from the UI):** a Next.js course about AI — lessons as MDX files, a prerequisite graph, a quiz at the end of each lesson, prev/next navigation. Everything under `content/lessons/`, `app/[locale]/lessons/*`, `app/[locale]/graph/*`, `components/lesson/*`, `components/graph/*`, `components/mdx/*`, `components/visuals/*`, `lib/lessons.ts`, `lib/graph-schema.ts`, `lib/progress.ts`, `scripts/validate-content.mjs` belongs to this old model.

**New model (what the home page is now):** an experiment-first environment. A feed of live anomalies grouped by theme (ML basics, neural nets + data, LLM internals, responsible AI). Each card opens one experiment. You pick a prediction before running. Real computation happens in the browser. Reveal animates. A short "delta" message explains only the gap between your prediction and the reality. No lessons. No grades. No finish line. See [components/experiments/](components/experiments/) for the current set.

The pivot was driven by first-principles thinking: understanding = the ability to predict a new situation, not the ability to recite. Learning happens at the friction between a prediction and what actually happens. Authors don't explain — they stage experiments where the learner's current model fails loudly, then surface the smallest bit of reasoning that closes the gap.

**Important consequence for Claude Code working here:** do not treat the lesson machinery as the canonical architecture. It is legacy — preserved because the content is useful and deleting would be destructive. The **visual part** of the app (everything a user can reach by clicking) lives in the new experiment model. The old routes (`/graph`, `/lessons`, `/lessons/[slug]`) still compile and still work if you type the URL, but no link in the UI points to them. The Header exposes the brand, an Instagram link (@probe.learn), and the language switcher — nothing else intentionally.

If the user asks to "improve the course" or "add a lesson," ask whether they mean (a) add a new experiment in the new model, or (b) edit the orphaned MDX material under `content/lessons/`. The default interpretation is **(a)**.

## Commands

```bash
npm run dev              # Next.js dev server on http://localhost:3000 (redirects / → /ru)
npm run build            # Runs the legacy content validator, then next build
npm run validate         # Just the validator (still enforces the old lesson corpus)
npm run lint             # next lint

npm run test             # Vitest — unit tests under tests/unit/
npm run test:watch
npx vitest run tests/unit/progress.test.ts   # Single test file

npm run test:e2e         # Playwright — spins up `npm run build && npm run start`
# Before first e2e run: npx playwright install chromium
```

The content validator and the e2e test still target the legacy lesson model. They must stay green so the orphaned routes keep compiling, but **do not write new experiments to fit their shape**. When the first experiment fully replaces the lesson flow, retire both.

## Architecture — new model (experiment-first)

**Home = the dark "observatory" landing.** [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx) is an RSC rendering the landing from the design exploration in [design/](design/): night background, orbit-animation hero (CSS keyframes `pOrbit*` in globals.css), monospace kicker, Unbounded display title, sun-colored pill CTA, then four full-width chapter rows (01 Математика · 02 Геометрия · 03 Физика · 04 ИИ), each with its accent color and an animated glyph, linking to `/chapters/<key>`. Copy lives under the top-level `landing` namespace in the locale files. The home page has no CTA to anywhere else (no lessons, no graph).

**Chapters = the light feed pages.** [app/[locale]/chapters/[chapter]/page.tsx](app/%5Blocale%5D/chapters/%5Bchapter%5D/page.tsx) holds a `CHAPTERS` const (math / geometry / physics / ai) with per-chapter band color. Each page: colored hero band (chapter number + title + description), a numbered sidebar («Разделы», hidden below `lg`), and white rounded experiment cards. math/geometry/physics have one flat group of 3 experiments; ai nests the 5 original groups (`mlBasics`, `neuralData`, `llm`, `responsible`, `aiEngineering`) as numbered sections. Group headings/descriptions live under `experiments.feed.groups.<key>` (including `ai`); chapter titles under `landing.chapters.<key>.title`. `/science` is a 307 redirect to `/` (the old combined science feed). Adding an experiment = add to `SLUGS` + an `if` block in the experiment router, add to `CHAPTERS` here, add i18n in both locales.

**Science experiments (math / geometry / physics).** 3 per chapter, ordered as a mini-arc (inspired by seeing-theory.brown.edu), same predict → observe → delta shape, and the visualization itself is the computation. Math is a probability arc: DiceAverage (law of large numbers), GaltonBoard (binomial bell from real coin-flip bounces), BirthdayParadox (coincidence probability grows with pairs, not people — 100 fully simulated classes of 23 random birthdays; it replaced MontyHall, whose setup proved too hard to grasp from one sentence). Geometry is a measurement arc: MonteCarloPi (π from a random rain of 2000 points), EarthRope (the rope-around-the-equator gap, computed for Earth and a football to show the radius cancels; on-screen gap exaggerated and labeled via `scaleNote`), AreaScaling (area counted in grid cells, no formula). Physics is a motion arc: Pendulum (mass written into torque *and* inertia of a real integrator, so the cancellation happens in the browser), ProjectileAngle (integrated ballistics; 45° wins, 30° = 60°), BrakingDistance (integrated deceleration; double speed → 4× distance). The seeded RNG lives in [lib/rng.ts](lib/rng.ts) — import it, don't copy it. Each simulation's core claim is asserted in [tests/unit/science.test.ts](tests/unit/science.test.ts).

**Experiments live under [components/experiments/](components/experiments/).** Each experiment is a single self-contained client component that owns its own state machine, visualization, and "delta" copy. There is no shared framework — each `*Playground.tsx` repeats the basic shape. If you find yourself copying a helper across 3+ files, that's the moment to extract, not sooner.

**Routing.** [app/[locale]/experiments/[slug]/page.tsx](app/%5Blocale%5D/experiments/%5Bslug%5D/page.tsx) holds a `SLUGS` const array and a chain of `if (slug === "...")` blocks, each pulling translations and constructing a `labels` object for one component. Every block returns its playground wrapped in [ExperimentShell](components/ExperimentShell.tsx). `generateStaticParams` pre-renders every slug × locale. Adding a new experiment = add to `SLUGS`, add an `if` block, add the slug to `CHAPTERS` in the chapters page **and** to `META` in the ExperimentShell, add the translation key (including a `theory` block) in both locale files.

**Every experiment page = breadcrumb + playground + theory.** [ExperimentShell](components/ExperimentShell.tsx) owns the page chrome: a back-to-chapter breadcrumb on top (its `META` maps slug → chapter/ns and must stay in sync with the chapters page) and a [TheorySection](components/TheorySection.tsx) below the playground. Theory content lives under `experiments.<ns>.theory` in the locale files — `intro` (array of paragraphs, read via `t.raw`), `keyIdea` (one callout), `examples` (array of `{title, body}` cards); shared labels («Теория», «Ключевая идея», «Примеры») under `experiments.theoryCommon`. The static diagram per experiment lives in [components/theory/TheoryVisual.tsx](components/theory/TheoryVisual.tsx) — a `switch(slug)` of small SVGs with per-locale captions (RU/KY dicts at the top of the file). [tests/unit/theory.test.ts](tests/unit/theory.test.ts) fails if a wired experiment lacks a theory block in either locale — the shell reads it unconditionally. The theory explains *after* the learner has predicted and observed; never move it above the playground.

**Site footer.** [components/Footer.tsx](components/Footer.tsx) renders «Elvira Albaeva © 2026» on every page (dark variant on the landing, like the Header). The layout's body is a `min-h-dvh` flex column so the footer stays at the bottom.

**The experiment state machine** has three phases. `idle`: the learner sees the setup and picks a prediction. The Run button is gated on having a prediction — no prediction, no learning. `running`: a `useEffect` schedules animation steps via `setTimeout`, mutating an `animStep` (or equivalent) counter that drives visibility/opacity of results. `revealed`: results + delta message + reshuffle button. Reshuffle resets phase to `idle`; if the experiment has a seeded dataset (like Overfitting), bumping the seed re-runs `useMemo` for data/fits. Not every experiment uses SVG — some render HTML lists (PromptInjection, HumanInTheLoop), others animate CSS widths (CacheAndReuse), others drive per-item latency timers (ModelSizeMatters). The phase machine is the common bone.

**Real computation, not mocked reveals.** [lib/fit.ts](lib/fit.ts) fits polynomials via normal equations + naive Gaussian elimination. X is normalized to `[0, 1]` before fitting to keep the Vandermonde matrix conditioned. [lib/dataset.ts](lib/dataset.ts) generates seeded noisy points (mulberry32 + Box-Muller Gaussian). The polynomial-9 curve visibly oscillates between the training points because it **is** the unique degree-9 polynomial through them, computed in the user's browser, not a pre-baked path. [CacheAndReusePlayground.tsx](components/experiments/CacheAndReusePlayground.tsx) uses a real `performance.now()` + `setTimeout` to make the latency gap between "fresh" and "cached" genuinely perceptible. This is the philosophical point: **never fake the reveal**. If an experiment claims to show the learner a phenomenon, the learner should be watching the actual phenomenon.

**When honest staging requires recorded data, label it.** [HallucinationPlayground.tsx](components/experiments/HallucinationPlayground.tsx) shows token-probability bars that are hand-authored (no live LLM call). A small italic note under the situation text (`recordedNote` key) states the probabilities are recorded, not generated live. If you add an experiment that can't compute the phenomenon in the browser, do the same: tell the learner, don't fake the air of live computation.

**The "delta" is the whole teaching payload.** After the reveal, each experiment branches on the learner's prediction vs the actual result and shows one of 2–4 short messages. Nothing in the experiment explains the concept in the abstract before the learner has seen it happen. The term arrives as a name for what just happened. Every new experiment must preserve this shape: predict → observe → receive a name for the gap. Branching on more than "right/wrong" is often worth it — ModelSizeMatters has `right | overkill | underkill` because lumping "overkill" with "underkill" produces misleading copy.

**i18n for experiments.** Copy lives under `experiments.<experimentKey>` in `messages/{ru,ky}.json`. The `labels` object is assembled in the route handler (server-side, `getTranslations`) and passed as a prop to the client component — this keeps the client free of `useTranslations` and makes preview with alternate strings trivial. Both locales must stay in sync. The Kyrgyz copy leans on concrete analogies (балта менен нан кеспейсиң, жасалма акча, почта үчүн жүк унаа) rather than literal translation — preserve that voice when adding new copy.

**Design system ("Probe explorations", adopted from [design/](design/)).** Two coordinated palettes in [tailwind.config.ts](tailwind.config.ts). Light pages (chapters, experiments, legacy): `bg` #FFFDF8 cream, `surface` #F3EDE2, `fg` #241F1A ink, `accent` #E05C4A coral-red, `done` #2A7F8C teal, `border`, `muted`, plus chapter accents `teal`/`gold`/`plum`. Dark landing: `night` #14162B, `cream`, `coral`, `sun`, `sky`, `lilac`. Don't hardcode hex in components — except SVG children, where Tailwind classes don't affect fills; if the palette changes, grep the hex values in `components/experiments/` and `components/visuals/` and update manually (current SVG palette: #E05C4A, #2A7F8C, #7B5EA7, #8A8175, #E5DFD2, #241F1A, #FFFDF8, #F2B134). Fonts via `next/font/google` with Cyrillic subsets: Unbounded (`font-display`, headings/numbers) + Rubik (`--font-body`, body); Playfair Display is gone, and Bricolage Grotesque was tried long ago and fails because it's Latin-only. Landing/glyph animations are the `p*` keyframes in [app/globals.css](app/globals.css). The layout's `<main>` has no container — every page brings its own (`mx-auto max-w-* px-6 pb-20`), which is what lets the landing and chapter bands run full-bleed.

**Header is deliberately minimal.** [components/Header.tsx](components/Header.tsx) — dot+Probe brand, one «Главы» link to `/`, Instagram icon link (@probe.learn, opens in new tab), and the РУ/КЫ pill switcher. It renders a dark variant on the landing (`pathname === "/"`) and a light variant everywhere else. Do not add navigation links back to `/lessons` or `/graph` without an explicit user request: the whole point of the pivot is that there is nowhere else to go on purpose.

**Analytics.** Umami Cloud is wired in [app/[locale]/layout.tsx](app/%5Blocale%5D/layout.tsx) via `<Script strategy="afterInteractive">` with `data-website-id="c4a409df-dcf2-4cc6-a35d-96653950e02d"`. No cookies, no consent banner required.

**Orphaned experiments.** [AISafetyPlayground.tsx](components/experiments/AISafetyPlayground.tsx) is kept in the repo but unreferenced — it was a scenario-quiz shape that violated "predict → observe → receive a name for the gap" (quiz, not experiment). The `aiSafety` JSON entry is also still in both locale files. Same treatment as the orphaned lessons: preserve because the Kyrgyz scenario copy is useful source material; do not wire back into the feed without a rework. [MontyHallPlayground.tsx](components/experiments/MontyHallPlayground.tsx) is orphaned too (with its `montyHall` JSON entries in both locales): the simulation is sound, but the one-sentence setup was too hard to understand, so BirthdayParadox took its math-chapter slot; re-wiring it would need a much more patient staging of the game's rules.

**Temporarily hidden experiments.** [CacheAndReusePlayground.tsx](components/experiments/CacheAndReusePlayground.tsx) and [ModelSizeMattersPlayground.tsx](components/experiments/ModelSizeMattersPlayground.tsx) have a prediction-readout bug and are currently removed from both `GROUPS` in the home page and `SLUGS` in the experiment router (direct URLs return 404). The components and their i18n keys are intact — re-wiring them requires only adding back the slug entries once the bug is fixed.

## Architecture — legacy model (orphaned, do not extend)

The lesson machinery is still wired end-to-end. It exists because the lesson material may still be useful as source for future experiments (especially the hooks and scenario-based quizzes, which were themselves a step toward the new model).

**Lessons** are defined by three coupled things: [content/graph.ts](content/graph.ts) (ordered id list), `content/lessons/{ru,ky}/<id>.mdx` (one file per id per locale, Zod-validated frontmatter from [lib/graph-schema.ts](lib/graph-schema.ts)), and [scripts/validate-content.mjs](scripts/validate-content.mjs) (runs before `next build`). Both locales are required. Frontmatter includes a required `hook: { situation, question }` (anomaly the lesson opens with) and `quiz` items with optional `scenario` strings — these were added during the pivot as stepping stones and the patterns are worth reading before designing new experiments.

**Lesson page composition.** [app/[locale]/lessons/[slug]/page.tsx](app/%5Blocale%5D/lessons/%5Bslug%5D/page.tsx) reads MDX via [lib/lessons.ts](lib/lessons.ts), renders via `next-mdx-remote/rsc` with MDX components from [components/mdx/registry.ts](components/mdx/registry.ts) (`Term`, `Callout`, `Patterns`, `Flow`, `Aside`), and looks up a right-column visual via [components/visuals/registry.tsx](components/visuals/registry.tsx). [LessonShell](components/lesson/LessonShell.tsx) is a client component with a two-column layout and renders hook → concept → exercise → quiz, plus a `NextDoors` section that shows 2–3 candidate lessons as question-doors.

**Progress** ([lib/progress.ts](lib/progress.ts)) is a Zustand store persisted to `localStorage` under `jeongwon:progress`. `statusOf(id, prerequisites, done)` returns `done | available | suggested`. `suggested` replaced the earlier `locked` state: prerequisites are now soft recommendations, never blocks. `hasHydrated` guards SSR/CSR mismatches.

**Graph view.** [components/graph/LessonGraph.tsx](components/graph/LessonGraph.tsx) wraps React Flow with a dagre layout ([components/graph/layout.ts](components/graph/layout.ts)). Unreachable from the UI but still renders when URL-typed.

**YAML gotcha** (learned the hard way): unquoted Russian/Kyrgyz strings in frontmatter that contain `: ` (colon-space) or start with `«` followed by a colon later in the line break `gray-matter`. If you edit an MDX frontmatter and the build fails with a YAML parse error, wrap the offending scenario/explanation in double quotes.

## i18n

[i18n/routing.ts](i18n/routing.ts) is the single source of truth for locales (`ru`, `ky`). [middleware.ts](middleware.ts) redirects unknown paths to `/ru`. All UI routes live under `app/[locale]/…`. Use `Link` / `useRouter` / `usePathname` from `@/i18n/routing`, **not** `next/link` directly — those wrappers preserve the active locale.

## Roadmap (for context when interpreting new requests)

The user has explicitly expressed interest in these next steps, in rough priority:

1. **Prediction history.** Local-first (localStorage, extending or replacing the progress store). Every prediction the learner has made, with the actual result. This is the substrate for spaced re-encounter: when a new experiment's underlying concept has already been predicted-wrong in the past, surface the old experiment as a 20-second re-run reminder inline.
2. **Feed ordering by connection.** Right now the feed shows all experiments in fixed group order. Once prediction history exists, reorder: "what you haven't seen yet" first, then "what connects to things you've predicted wrong." No streaks, no achievements — just quieter signal.
3. **Retire or rework the orphaned `aiSafety` quiz.** Either delete it and its i18n entries entirely, or rework it into a genuine experiment (it currently sits unreferenced but compiling).
4. **Retire the legacy lesson model.** When the new model feels complete, delete `content/lessons/`, `app/[locale]/lessons/*`, `app/[locale]/graph/*`, `components/lesson/*`, `components/graph/*`, `components/mdx/*`, `components/visuals/*`, `lib/lessons.ts`, `lib/graph-schema.ts`, `lib/progress.ts` (or replace with the prediction history store), `scripts/validate-content.mjs`, and the lesson-specific `validate` / `test:e2e` scripts. The content validator currently runs before every build and enforces the orphaned lesson corpus — that's dead weight.

Already done (for context, not a roadmap item): second experiment, feed of anomalies, responsible-AI group (PromptInjection, HumanInTheLoop — live; CacheAndReuse, ModelSizeMatters — built but temporarily hidden), retirement of the AISafetyPlayground quiz shape, Instagram link in header, Umami analytics, `aiEngineering` "go deeper" group inspired by Chip Huyen's *AI Engineering* (Temperature — live softmax sampling; Retrieval — live keyword-search scoring over the translated docs, the per-locale trap is asserted in `tests/unit/ai-engineering.test.ts`; Tokenizer — a real BPE tokenizer trained in-browser on an English mini-corpus).

**Future experiment ideas** are sketched in [plan.md](plan.md) at the repo root — 14 Kyrgyz-language concepts spanning responsible AI (prompt injection, deepfake, bias, hallucination confidence) and environmental cost (energy per query, water for cooling, carbon footprint, green habits). These are design notes, not wired code.

Do not implement any of the roadmap items without a direct user request — they are listed so that when the user says "do the next thing," you have context for what they probably mean.
