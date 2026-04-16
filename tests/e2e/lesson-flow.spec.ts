import { test, expect } from "@playwright/test";

test("open graph, complete first lesson, see node marked done", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ru$/);

  await page.goto("/ru/graph");
  await expect(page.getByTestId("lesson-graph")).toBeVisible();

  const firstNode = page.getByTestId("lesson-node-what-is-ai");
  await expect(firstNode).toBeVisible();
  await expect(firstNode).toHaveAttribute("data-status", "available");

  await firstNode.click();
  await expect(page).toHaveURL(/lessons\/what-is-ai/);

  // Answer both quiz questions correctly.
  await page.getByTestId("quiz-0-opt-1").click();
  await page.getByTestId("quiz-1-opt-1").click();
  await page.getByTestId("quiz-submit").click();
  await expect(page.getByTestId("quiz-score")).toBeVisible();

  // Return to graph and confirm status is "done".
  await page.goto("/ru/graph");
  await expect(
    page.getByTestId("lesson-node-what-is-ai"),
  ).toHaveAttribute("data-status", "done");
  await expect(
    page.getByTestId("lesson-node-learning-from-data"),
  ).toHaveAttribute("data-status", "available");

  // A lesson with unmet prerequisites is still openable (soft suggestion).
  const llmNode = page.getByTestId("lesson-node-llm");
  await expect(llmNode).toHaveAttribute("data-status", "suggested");
  await llmNode.click();
  await expect(page).toHaveURL(/lessons\/llm/);
});
