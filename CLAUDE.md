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

**Home = a feed of experiments.** [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx) is an RSC that reads a static `GROUPS` list (4 groups × N experiments each), pulls `label`/`title`/`situation` from `experiments.<ns>` for each card, and renders a grouped grid. Each card links to `/[locale]/experiments/<slug>`. Group headings and taglines live under `experiments.feed.groups.<key>` in the locale files. The home page has no CTA to anywhere else (no lessons, no graph).

**Experiments live under [components/experiments/](components/experiments/).** Each experiment is a single self-contained client component that owns its own state machine, visualization, and "delta" copy. There is no shared framework — each `*Playground.tsx` repeats the basic shape. If you find yourself copying a helper across 3+ files, that's the moment to extract, not sooner.

**Routing.** [app/[locale]/experiments/[slug]/page.tsx](app/%5Blocale%5D/experiments/%5Bslug%5D/page.tsx) holds a `SLUGS` const array and a chain of `if (slug === "...")` blocks, each pulling translations and constructing a `labels` object for one component. `generateStaticParams` pre-renders every slug × locale. Adding a new experiment = add to `SLUGS`, add an `if` block, add the `ns` to `GROUPS` in the home page, add the translation key in both locale files.

**The experiment state machine** has three phases. `idle`: the learner sees the setup and picks a prediction. The Run button is gated on having a prediction — no prediction, no learning. `running`: a `useEffect` schedules animation steps via `setTimeout`, mutating an `animStep` (or equivalent) counter that drives visibility/opacity of results. `revealed`: results + delta message + reshuffle button. Reshuffle resets phase to `idle`; if the experiment has a seeded dataset (like Overfitting), bumping the seed re-runs `useMemo` for data/fits. Not every experiment uses SVG — some render HTML lists (PromptInjection, HumanInTheLoop), others animate CSS widths (CacheAndReuse), others drive per-item latency timers (ModelSizeMatters). The phase machine is the common bone.

**Real computation, not mocked reveals.** [lib/fit.ts](lib/fit.ts) fits polynomials via normal equations + naive Gaussian elimination. X is normalized to `[0, 1]` before fitting to keep the Vandermonde matrix conditioned. [lib/dataset.ts](lib/dataset.ts) generates seeded noisy points (mulberry32 + Box-Muller Gaussian). The polynomial-9 curve visibly oscillates between the training points because it **is** the unique degree-9 polynomial through them, computed in the user's browser, not a pre-baked path. [CacheAndReusePlayground.tsx](components/experiments/CacheAndReusePlayground.tsx) uses a real `performance.now()` + `setTimeout` to make the latency gap between "fresh" and "cached" genuinely perceptible. This is the philosophical point: **never fake the reveal**. If an experiment claims to show the learner a phenomenon, the learner should be watching the actual phenomenon.

**When honest staging requires recorded data, label it.** [HallucinationPlayground.tsx](components/experiments/HallucinationPlayground.tsx) shows token-probability bars that are hand-authored (no live LLM call). A small italic note under the situation text (`recordedNote` key) states the probabilities are recorded, not generated live. If you add an experiment that can't compute the phenomenon in the browser, do the same: tell the learner, don't fake the air of live computation.

**The "delta" is the whole teaching payload.** After the reveal, each experiment branches on the learner's prediction vs the actual result and shows one of 2–4 short messages. Nothing in the experiment explains the concept in the abstract before the learner has seen it happen. The term arrives as a name for what just happened. Every new experiment must preserve this shape: predict → observe → receive a name for the gap. Branching on more than "right/wrong" is often worth it — ModelSizeMatters has `right | overkill | underkill` because lumping "overkill" with "underkill" produces misleading copy.

**i18n for experiments.** Copy lives under `experiments.<experimentKey>` in `messages/{ru,ky}.json`. The `labels` object is assembled in the route handler (server-side, `getTranslations`) and passed as a prop to the client component — this keeps the client free of `useTranslations` and makes preview with alternate strings trivial. Both locales must stay in sync. The Kyrgyz copy leans on concrete analogies (балта менен нан кеспейсиң, жасалма акча, почта үчүн жүк унаа) rather than literal translation — preserve that voice when adding new copy.

**Design system.** "Aged paper" Tailwind tokens from [tailwind.config.ts](tailwind.config.ts) (`bg`, `surface`, `fg`, `accent`, `border`, `muted`, `done`) — don't hardcode hex in components. SVG experiments DO hardcode hex in `<svg>` children because Tailwind classes don't affect SVG fills; if the palette changes, grep for the hex values in both `components/experiments/` and `components/visuals/` and update manually. Headings: `font-display` (Playfair Display via `next/font/google`, needs Cyrillic subsets — Bricolage Grotesque was tried and fails because it's Latin-only).

**Header is deliberately minimal.** [components/Header.tsx](components/Header.tsx) — brand, Instagram icon link (@probe.learn, opens in new tab), and the locale switcher. Do not add navigation links back to `/lessons` or `/graph` without an explicit user request: the whole point of the pivot is that there is nowhere else to go on purpose.

**Analytics.** Umami Cloud is wired in [app/[locale]/layout.tsx](app/%5Blocale%5D/layout.tsx) via `<Script strategy="afterInteractive">` with `data-website-id="c4a409df-dcf2-4cc6-a35d-96653950e02d"`. No cookies, no consent banner required.

**Orphaned experiments.** [AISafetyPlayground.tsx](components/experiments/AISafetyPlayground.tsx) is kept in the repo but unreferenced — it was a scenario-quiz shape that violated "predict → observe → receive a name for the gap" (quiz, not experiment). The `aiSafety` JSON entry is also still in both locale files. Same treatment as the orphaned lessons: preserve because the Kyrgyz scenario copy is useful source material; do not wire back into the feed without a rework.

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

Already done (for context, not a roadmap item): second experiment, feed of anomalies, responsible-AI group (PromptInjection, HumanInTheLoop — live; CacheAndReuse, ModelSizeMatters — built but temporarily hidden), retirement of the AISafetyPlayground quiz shape, Instagram link in header, Umami analytics.

**Future experiment ideas** are sketched in [plan.md](plan.md) at the repo root — 14 Kyrgyz-language concepts spanning responsible AI (prompt injection, deepfake, bias, hallucination confidence) and environmental cost (energy per query, water for cooling, carbon footprint, green habits). These are design notes, not wired code.

Do not implement any of the roadmap items without a direct user request — they are listed so that when the user says "do the next thing," you have context for what they probably mean.
