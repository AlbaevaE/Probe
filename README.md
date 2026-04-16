# Probe

An interactive learning platform where you understand AI by predicting what will happen — then watching it happen for real.

## Why this exists

Most AI courses explain concepts, then test if you can repeat them. That's memorization, not understanding.

**Understanding is the ability to predict a new situation.** If you can't predict what a model will do on data it hasn't seen, you don't understand overfitting — you've just memorized the word.

Probe flips the script. Every experiment starts with a question: *"What do you think will happen?"* You commit to a prediction. Then the computation runs — in your browser, with real math, not a pre-baked animation. The result either confirms your mental model or breaks it. When it breaks, a short message names only the gap between what you expected and what happened.

No lectures before the experiment. No grades. No finish line. Just prediction, observation, and the smallest explanation that closes the gap.

## How it works

Each experiment follows the same loop:

```
idle → pick a prediction → run → observe the result → read the delta → reshuffle and try again
```

- **Prediction gate**: You can't run the experiment without committing to an answer first. No prediction, no learning.
- **Real computation**: Polynomials are fitted via normal equations. Neural networks run actual forward passes. KNN counts actual neighbors. Nothing is faked.
- **Delta, not lecture**: After the reveal, you get one of 2-3 short messages tailored to what you predicted vs. what happened. The term (e.g., "overfitting") arrives as a *name for what you just saw*, not an abstract definition.
- **Reshuffle**: New random seed, new data, new experiment. The underlying phenomenon stays the same, but the numbers change — so you can test whether you actually understood or just memorized one example.

## Experiments

The platform currently has 9 interactive experiments, grouped by theme:

### ML Basics
| Experiment | What you learn |
|---|---|
| **Overfitting** | A curve that fits training data perfectly can fail catastrophically on new data |
| **K-Nearest Neighbors** | Classification by majority vote of closest points; changing K changes the answer |
| **Gradient Descent** | Optimization doesn't always find the best solution — starting point matters |
| **Decision Boundary** | The shape of the dividing line determines classification accuracy |

### Neural Networks & Data
| Experiment | What you learn |
|---|---|
| **Neural Network** | Each node contributes to the output; disabling one shifts the result predictably |
| **Data Balance** | A model trained on imbalanced data learns to ignore the minority group |

### How LLMs Work
| Experiment | What you learn |
|---|---|
| **LLM Pipeline** | A chat message goes through tokenization, embedding, attention, and token-by-token generation — each token is a full forward pass |
| **Hallucination** | LLMs pick the statistically likely next word, not the factually correct one |

### Responsible AI
| Experiment | What you learn |
|---|---|
| **AI Safety** | Some tasks are safe to delegate to AI; others need human oversight |

## Tech stack

- **Next.js 15** with App Router and React Server Components
- **React 19** with client-side interactive experiments
- **TypeScript** throughout
- **Tailwind CSS** with a custom warm color palette
- **next-intl** for Russian and Kyrgyz locales
- **Zustand** for client-side state persistence
- **Vitest** for unit tests (33 tests covering experiment math)
- **Playwright** for E2E tests (experiment flow + home page)
- No database. No API keys. All computation runs in the browser.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Commands

```bash
npm run dev          # Dev server (redirects / to /ru)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright — run `npx playwright install chromium` first)
```

## Project structure

```
app/[locale]/                    # Pages (ru, ky)
  page.tsx                       # Home — experiment feed grouped by theme
  experiments/[slug]/page.tsx    # Individual experiment pages
components/experiments/          # 9 interactive experiment components
lib/
  fit.ts                         # Polynomial fitting (normal equations)
  dataset.ts                     # Seeded data generation (mulberry32 PRNG)
messages/
  ru.json                        # Russian translations
  ky.json                        # Kyrgyz translations
tests/
  unit/                          # Vitest: fit, dataset, KNN, neural net, gradient descent
  e2e/                           # Playwright: experiment flow, grouped home page
```

## Languages

The platform is fully translated in:
- **Russian** (default)
- **Kyrgyz**

## Philosophy in one sentence

Authors don't explain — they stage experiments where the learner's current model fails loudly, then surface the smallest bit of reasoning that closes the gap.

## License

MIT
