import { expect, type Page } from 'playwright/test';
import {
  IFB_FIGMA_GRID_TESTID,
  IFB_FIGMA_VALIDATION_TAB_LABEL,
  IFB_ROOT_TESTIDS,
  INPUT_FEEDBACK_PLAYGROUND_ROUTE,
} from './manifest';
import { feedbackWrapper } from './inputFeedbackHelpers';

export async function gotoInputFeedbackPlayground(page: Page): Promise<void> {
  await page.goto(INPUT_FEEDBACK_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
}

export async function openInputFeedbackTestScenarios(page: Page): Promise<void> {
  await gotoInputFeedbackPlayground(page);
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await expect(
    page.getByRole('heading', { name: 'Input Feedback', exact: true, level: 1 }),
  ).toBeVisible();
  await feedbackWrapper(page, IFB_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
}

export async function openInputFeedbackFigmaValidationTab(page: Page): Promise<void> {
  await gotoInputFeedbackPlayground(page);
  await page.getByRole('tab', { name: IFB_FIGMA_VALIDATION_TAB_LABEL }).click();
  await expect(page.getByRole('heading', { name: 'InputFeedback', level: 2 })).toBeVisible();
  await page.getByTestId(IFB_FIGMA_GRID_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
