import { test, expect } from "@playwright/test";

test("experiment flow: landing → AI chapter → overfitting → predict → run → results → reshuffle", async ({
  page,
}) => {
  // 1. Navigate to the landing
  await page.goto("/");
  await expect(page).toHaveURL(/\/ru$/);

  // 2. Open the AI chapter from the chapter list
  await page.getByTestId("chapter-ai").click();
  await expect(page).toHaveURL(/chapters\/ai/);

  // 3. Verify experiment cards are visible, then open overfitting
  await expect(page.getByTestId("experiment-card-overfitting")).toBeVisible();
  await expect(page.getByTestId("experiment-card-knn")).toBeVisible();
  await page.getByTestId("experiment-card-overfitting").click();
  await expect(page).toHaveURL(/experiments\/overfitting/);

  // 4. Run button should be disabled without a prediction
  const runBtn = page.getByTestId("run-button");
  await expect(runBtn).toBeDisabled();

  // 5. Make a prediction (click "linear" option)
  await page.getByTestId("option-linear").click();
  await expect(runBtn).toBeEnabled();

  // 6. Click run button
  await runBtn.click();

  // 7. Wait for results section to appear (animation takes ~2.6s)
  await expect(page.getByTestId("results-section")).toBeVisible({
    timeout: 5000,
  });

  // 8. Click reshuffle
  await page.getByTestId("reshuffle-button").click();

  // 9. Verify experiment resets: results gone, options are back
  await expect(page.getByTestId("results-section")).not.toBeVisible();
  await expect(page.getByTestId("option-linear")).toBeVisible();
  await expect(page.getByTestId("option-linear")).toBeEnabled();
});

test("landing lists the four chapters", async ({ page }) => {
  await page.goto("/ru");

  await expect(page.getByTestId("chapter-math")).toBeVisible();
  await expect(page.getByTestId("chapter-geometry")).toBeVisible();
  await expect(page.getByTestId("chapter-physics")).toBeVisible();
  await expect(page.getByTestId("chapter-ai")).toBeVisible();
});

test("AI chapter shows themed group headings and cards", async ({ page }) => {
  await page.goto("/ru/chapters/ai");

  await expect(page.getByText("Основы машинного обучения")).toBeVisible();
  await expect(page.getByText("Нейросети и данные")).toBeVisible();
  await expect(page.getByText("Как устроены LLM")).toBeVisible();
  await expect(page.getByText("Ответственный ИИ", { exact: true })).toBeVisible();

  await expect(page.getByTestId("experiment-card-overfitting")).toBeVisible();
  await expect(page.getByTestId("experiment-card-neural-network")).toBeVisible();
  await expect(page.getByTestId("experiment-card-llm-pipeline")).toBeVisible();
  await expect(page.getByTestId("experiment-card-prompt-injection")).toBeVisible();
});

test("science chapters list their experiments", async ({ page }) => {
  await page.goto("/ru/chapters/math");
  await expect(page.getByTestId("experiment-card-dice-average")).toBeVisible();
  await expect(page.getByTestId("experiment-card-galton-board")).toBeVisible();
  await expect(page.getByTestId("experiment-card-birthday-paradox")).toBeVisible();

  await page.goto("/ru/chapters/physics");
  await expect(page.getByTestId("experiment-card-pendulum")).toBeVisible();
  await expect(page.getByTestId("experiment-card-braking-distance")).toBeVisible();
});
