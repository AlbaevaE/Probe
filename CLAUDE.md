# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project direction — read first

This project has pivoted. What's live today is **not** the lesson-based course the original scaffolding was built for.

**Old model (still in the repo but orphaned from the UI):** a Next.js course about AI — lessons as MDX files, a prerequisite graph, a quiz at the end of each lesson, prev/next navigation. Everything under `content/lessons/`, `app/[locale]/lessons/*`, `app/[locale]/graph/*`, `components/lesson/*`, `components/graph/*`, `components/mdx/*`, `components/visuals/*`, `lib/lessons.ts`, `lib/graph-schema.ts`, `lib/progress.ts`, `scripts/validate-content.mjs` belongs to this old model.

**New model (what the home page is now):** an experiment-first environment. A single live anomaly on the home page. Pick a prediction before running. Real computation happens in the browser. Reveal animates. A short "delta" message explains only the gap between your prediction and the reality. No lessons. No grades. No finish line. See `components/experiments/OverfittingPlayground.tsx` for the first (and currently only) instance.

The pivot was driven by first-principles thinking: understanding = the ability to predict a new situation, not the ability to recite. Learning happens at the friction between a prediction and what actually happens. Authors don't explain — they stage experiments where the learner's current model fails loudly, then surface the smallest bit of reasoning that closes the gap.

**Important consequence for Claude Code working here:** do not treat the lesson machinery as the canonical architecture. It is legacy — preserved because the content is useful and deleting would be destructive. The **visual part** of the app (everything a user can reach by clicking) lives in the new experiment model. The old routes (`/graph`, `/lessons`, `/lessons/[slug]`) still compile and still work if you type the URL, but no link in the UI points to them. The Header exposes only the brand and the language switcher — intentionally.

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

**Home = one experiment.** [app/[locale]/page.tsx](app/%5Blocale%5D/page.tsx) is an RSC that collects i18n labels from the `experiments.*` namespace and renders one client experiment component. The home page has no CTA to anywhere else. It is the destination.

**Experiments live under [components/experiments/](components/experiments/).** Each experiment is a single self-contained client component that owns its own state machine, its own visualization, and its own "delta" copy. No shared framework yet — the first one is prototyped standalone on purpose. When a second experiment is added, extract the common shape (phases: `idle → running → revealed`, prediction gate, reveal animation, delta branches).

**The experiment state machine** has three phases. `idle`: the learner sees the setup and picks a prediction. The Run button is gated on having a prediction — no prediction, no learning. `running`: a `useEffect` schedules animation steps via `setTimeout`, mutating an `animStep` counter that drives opacity transitions in the SVG. `revealed`: results table + delta message + reshuffle button. Reshuffle bumps a seed, which re-runs `useMemo` for the dataset, the model fits, and the errors, and resets phase to `idle`. This shape will likely generalize to all experiments.

**Real computation, not mocked reveals.** [lib/fit.ts](lib/fit.ts) fits polynomials via normal equations + naive Gaussian elimination. X is normalized to `[0, 1]` before fitting to keep the Vandermonde matrix conditioned. [lib/dataset.ts](lib/dataset.ts) generates seeded noisy points (mulberry32 + Box-Muller Gaussian). The polynomial-9 curve visibly oscillates between the training points because it **is** the unique degree-9 polynomial through them, computed in the user's browser, not a pre-baked path. This is the philosophical point: **never fake the reveal**. If an experiment claims to show the learner a phenomenon, the learner should be watching the actual phenomenon.

**The "delta" is the whole teaching payload.** In `OverfittingPlayground`, after the reveal, a `<Delta>` branch picks one of three messages based on the learner's prediction vs the actual winner. Nothing in the experiment explains overfitting in the abstract before the learner has seen it happen. The term arrives as a name for what just happened. Every new experiment must preserve this shape: predict → observe → receive a name for the gap.

**i18n for experiments.** Copy lives under `experiments.<experimentKey>` in `messages/{ru,ky}.json`. Label objects are assembled in the RSC home page and passed as a `labels` prop to the client component — this keeps the client component free of `useTranslations` and makes it trivial to preview with different strings. Both locales must stay in sync; the experiments currently live in ru + ky in parallel.

**Design system.** Same "aged paper" Tailwind tokens from [tailwind.config.ts](tailwind.config.ts) (`bg`, `surface`, `fg`, `accent`, `border`, `muted`, `done`) — don't hardcode hex in components. SVG experiments DO hardcode hex in `<svg>` children because Tailwind classes don't affect SVG fills; if the palette changes, grep for the hex values in both `components/experiments/` and `components/visuals/` and update manually. Headings: `font-display` (Playfair Display via `next/font/google`, needs Cyrillic subsets — Bricolage Grotesque was tried and fails because it's Latin-only).

**Header is deliberately minimal.** [components/Header.tsx](components/Header.tsx) — brand + language switcher only. Do not add navigation links back to `/lessons` or `/graph` without an explicit user request: the whole point of the pivot is that there is nowhere else to go on purpose.

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

1. **Second experiment.** Candidates: live LLM token-probability demo (requires external API or mocked probabilities), or a "pick the dataset that's fair" dataset-bias experiment. The choice between real API and mocked reveal is an open design question — **never fake a reveal** is a hard constraint, so mocked probabilities would need to be honest about being recorded, not generated live.
2. **Feed of anomalies.** When ≥2 experiments exist, turn the home page into a short feed instead of a single experiment. Each card = one anomaly + a short "huh?" teaser + enter. No ordering beyond "what you haven't seen yet" and "what connects to things you've predicted wrong."
3. **Prediction history.** Local-first (localStorage, extending or replacing the progress store). Every prediction the learner has made, with the actual result. This is the substrate for spaced re-encounter: when a new experiment's underlying concept has already been predicted-wrong in the past, surface the old experiment as a 20-second re-run reminder inline.

Do not implement any of these without a direct user request — they are listed so that when the user says "do the next thing," you have context for what they probably mean.
