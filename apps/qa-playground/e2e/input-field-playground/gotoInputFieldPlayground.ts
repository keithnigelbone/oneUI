import { expect, type Page } from 'playwright/test';
import {
  IFF_FIGMA_GRID_TESTID,
  IFF_FIGMA_VALIDATION_TAB_LABEL,
  IFF_ROOT_TESTIDS,
  INPUT_FIELD_PLAYGROUND_ROUTE,
} from './manifest';
import { fieldInput } from './inputFieldHelpers';

export async function gotoInputFieldPlayground(page: Page): Promise<void> {
  await page.goto(INPUT_FIELD_PLAYGROUND_ROUTE);
  await expect(page.getByRole('tab', { name: 'Test Scenarios' })).toBeVisible();
}

export async function openInputFieldTestScenarios(page: Page): Promise<void> {
  await gotoInputFieldPlayground(page);
  await page.getByRole('tab', { name: 'Test Scenarios' }).click();
  await expect(
    page.getByRole('heading', { name: 'Input Field', exact: true, level: 1 }),
  ).toBeVisible();
  await fieldInput(page, IFF_ROOT_TESTIDS.default).waitFor({ state: 'visible', timeout: 90_000 });
}

export async function openInputFieldFigmaValidationTab(page: Page): Promise<void> {
  await gotoInputFieldPlayground(page);
  await page.getByRole('tab', { name: IFF_FIGMA_VALIDATION_TAB_LABEL }).click();
  await expect(page.getByRole('heading', { name: 'InputField', level: 2 })).toBeVisible();
  await page.getByTestId(IFF_FIGMA_GRID_TESTID).waitFor({ state: 'visible', timeout: 90_000 });
}
