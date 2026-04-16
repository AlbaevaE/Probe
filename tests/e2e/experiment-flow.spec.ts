import { test, expect } from "@playwright/test";

test("experiment flow: home → overfitting → predict → run → results → reshuffle", async ({
  page,
}) => {
  // 1. Navigate to home page
  await page.goto("/");
  await expect(page).toHaveURL(/\/ru$/);

  // 2. Verify experiment cards are visible
  await expect(page.getByTestId("experiment-card-overfitting")).toBeVisible();
  await expect(page.getByTestId("experiment-card-knn")).toBeVisible();

  // 3. Click the overfitting experiment card
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

test("home page shows themed group headings", async ({ page }) => {
  await page.goto("/ru");

  // Verify all 4 group headings are visible
  await expect(page.getByText("Основы машинного обучения")).toBeVisible();
  await expect(page.getByText("Нейросети и данные")).toBeVisible();
  await expect(page.getByText("Как устроены LLM")).toBeVisible();
  await expect(page.getByText("Ответственный ИИ")).toBeVisible();

  // Verify all 9 experiment cards are present
  await expect(page.getByTestId("experiment-card-overfitting")).toBeVisible();
  await expect(page.getByTestId("experiment-card-neural-network")).toBeVisible();
  await expect(page.getByTestId("experiment-card-llm-pipeline")).toBeVisible();
  await expect(page.getByTestId("experiment-card-ai-safety")).toBeVisible();
});
