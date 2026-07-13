import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getMetaBySlug } from '@/catalog/registry';
import { DividerFigmaValidationShowcase } from '@/components/divider/DividerFigmaValidationShowcase';
import { RadioFigmaValidationShowcase } from '@/components/radio/RadioFigmaValidationShowcase';
import { RadioFieldFigmaValidationShowcase } from '@/components/radio-field/RadioFieldFigmaValidationShowcase';
import { InputFeedbackFigmaValidationShowcase } from '@/components/input-feedback/InputFeedbackFigmaValidationShowcase';
import { InputFieldFigmaValidationShowcase } from '@/components/input-field/InputFieldFigmaValidationShowcase';
import { COMPONENT_QA_SHOWCASES } from '@/components/registerComponentShowcases';
import { CircularProgressIndicatorFigmaValidationGrid } from '@/components/circular-progress-indicator/CircularProgressIndicatorFigmaValidationGrid';
import { SwitchFigmaValidationGrid } from '@/components/switch/SwitchFigmaValidationGrid';
import { ChipFigmaValidationGrid } from '@/components/chip/ChipFigmaValidationGrid';
import { CounterBadgeFigmaValidationGrid } from '@/components/counter-badge/CounterBadgeFigmaValidationGrid';
import { IndicatorBadgeFigmaValidationGrid } from '@/components/indicator-badge/IndicatorBadgeFigmaValidationGrid';
import { ChipGroupFigmaValidationGrid } from '@/components/chip-group/ChipGroupFigmaValidationGrid';
import { StepperFigmaValidationGrid } from '@/components/stepper/StepperFigmaValidationGrid';
import { SliderApiValidationShowcase } from '@/components/slider/SliderApiValidationShowcase';
import { SliderFigmaValidationGrid } from '@/components/slider/SliderFigmaValidationGrid';
import { TouchSliderApiValidationShowcase } from '@/components/touch-slider/TouchSliderApiValidationShowcase';
import { TouchSliderFigmaValidationGrid } from '@/components/touch-slider/TouchSliderFigmaValidationGrid';
import {
  SelectApiValidationShowcase,
  SelectFigmaValidationGrid,
} from '@/components/select/SelectFigmaValidationGrid';
import { BottomNavigationFigmaValidationGrid } from '@/components/bottom-navigation/BottomNavigationFigmaValidationGrid';
import { IconApiValidationShowcase } from '@/components/icon/IconApiValidationShowcase';
import { IconFigmaValidationGrid } from '@/components/icon/IconFigmaValidationGrid';
import { IconButtonApiValidationShowcase } from '@/components/icon-button/IconButtonApiValidationShowcase';
import { IconButtonFigmaValidationGrid } from '@/components/icon-button/IconButtonFigmaValidationGrid';
import { IconContainedApiValidationShowcase } from '@/components/icon-contained/IconContainedApiValidationShowcase';
import { IconContainedFigmaValidationGrid } from '@/components/icon-contained/IconContainedFigmaValidationGrid';
import { ImageApiValidationShowcase } from '@/components/image/ImageApiValidationShowcase';
import { ImageFigmaValidationGrid } from '@/components/image/ImageFigmaValidationGrid';
import { SelectableButtonApiValidationShowcase } from '@/components/selectable-button/SelectableButtonApiValidationShowcase';
import { SelectableButtonFigmaValidationGrid } from '@/components/selectable-button/SelectableButtonFigmaValidationGrid';
import { SegmentedControlFigmaValidationGrid } from '@/components/segmented-control/SegmentedControlFigmaValidationGrid';
import { SingleTextButtonApiValidationShowcase } from '@/components/single-text-button/SingleTextButtonApiValidationShowcase';
import { SingleTextButtonFigmaValidationGrid } from '@/components/single-text-button/SingleTextButtonFigmaValidationGrid';
import { TooltipFigmaValidationGrid } from '@/components/tooltip/TooltipFigmaValidationGrid';
import { ModalFigmaValidationGrid } from '@/components/modal/ModalFigmaValidationGrid';
import { PaginationFigmaValidationGrid } from '@/components/pagination/PaginationFigmaValidationGrid';
import { PaginationDotsFigmaValidationGrid } from '@/components/pagination-dots/PaginationDotsFigmaValidationGrid';
import { WebHeaderFigmaValidationGrid } from '@/components/web-header/WebHeaderFigmaValidationGrid';
import { TabsFigmaValidationGrid } from '@/components/tabs/TabsFigmaValidationGrid';
import { CheckboxFieldFigmaValidationGrid } from '@/components/checkbox-field/CheckboxFieldFigmaValidationGrid';
import type { QAPlaywrightHistoryEntry, QAPlaywrightRunResponse } from '@/lib/qa/types';
import {
  isQaPlaywrightSlug,
  qaPlaywrightReportHistoryUrl,
  qaPlaywrightReportUrl,
  type QAPlaywrightSlug,
} from '@/lib/qa/qaPlaywrightSlugs';
import { parseHistoryFile } from '@/lib/qa/qaReportHistory';
import { QaReportDashboardWithHistory } from '@/lib/qa/testing/QaReportDashboardWithHistory';
import { QaDetailReportSection } from '@/lib/qa/testing/QaDetailReportSection';
import { useQaComponentTestRun } from '@/lib/qa/testing/useQaComponentTestRun';
import { QA_DETAIL_TAB_ICONS, type QaDetailTabId } from '@/lib/qa/testing/detailTabConfig';
import { getComponentTestStability } from '@/lib/qa/componentTestStability';
import { Badge } from '@oneui/ui/components/Badge';
import { Collapsible } from '@oneui/ui/components/Collapsible';
import { Divider } from '@oneui/ui/components/Divider';
import { Icon } from '@oneui/ui/components/Icon';
import { Button } from '@oneui/ui/components/Button';
import { Surface, SurfaceAppearanceScope } from '@oneui/ui/components/Surface';
import { TabGroup, TabItem } from '@oneui/ui/components/Tabs';
import { Text } from '@oneui/ui/components/Text';
import { CATEGORY_FILTER_LABEL } from '@/lib/qa/types';
import detail from '@/styles/detail.module.css';

type TabId =
  | 'scenarios'
  | 'figma'
  | 'accessibility'
  | 'functional'
  | 'dividerFigmaValidation'
  | 'radioFigmaValidation'
  | 'radioFieldFigmaValidation'
  | 'inputFeedbackFigmaValidation'
  | 'inputFieldFigmaValidation';

/** Slugs that render the shared **Figma Validation** tab (`SwitchFigmaValidationGrid`, `StepperFigmaValidationGrid`, etc.). */
const FIGMA_VALIDATION_SLUGS = [
  'switch',
  'stepper',
  'slider',
  'touch-slider',
  'icon',
  'icon-button',
  'icon-contained',
  'image',
  'selectable-button',
  'single-text-button',
  'counter-badge',
  'indicator-badge',
  'chip',
  'chip-group',
  'modal',
  'circular-progress-indicator',
  'bottom-navigation',
  'pagination',
  'pagination-dots',
  'tabs',
  'tooltip',
  'checkbox-field',
  'segmented-control',
  'select',
  'web-header',
] as const;

function slugHasFigmaValidationTab(slug: string): boolean {
  return (FIGMA_VALIDATION_SLUGS as readonly string[]).includes(slug);
}

const QA_LOAD_REPORT_HINT: Record<QAPlaywrightSlug, string> = {
  button:
    'Run from repo root: pnpm qa:button:report (writes apps/qa-playground/public/qa-reports/button-summary.json), ensure dev server is apps/qa-playground (e.g. pnpm dev:qa-playground), then use Load Playwright report.',
  checkbox:
    'Run: pnpm qa:checkbox:report (writes apps/qa-playground/public/qa-reports/checkbox-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'counter-badge':
    'Run: pnpm qa:counter-badge:report (writes apps/qa-playground/public/qa-reports/counter-badge-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'indicator-badge':
    'Run: pnpm qa:indicator-badge:report (writes apps/qa-playground/public/qa-reports/indicator-badge-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  avatar:
    'Run: pnpm qa:avatar:report (writes apps/qa-playground/public/qa-reports/avatar-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  badge:
    'Run: pnpm qa:badge:report (writes apps/qa-playground/public/qa-reports/badge-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  divider:
    'Run: pnpm qa:divider:report (Playwright starts Vite on port 5193, then writes apps/qa-playground/public/qa-reports/divider-summary.json). For manual browsing use pnpm dev:qa-playground, then Load Playwright report.',
  radio:
    'Run: pnpm qa:radio:report (writes apps/qa-playground/public/qa-reports/radio-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  switch:
    'Run: pnpm qa:switch:report (writes apps/qa-playground/public/qa-reports/switch-summary.json), ensure dev server is apps/qa-playground (e.g. pnpm dev:qa-playground), then use Load Playwright report.',
  stepper:
    'Run: pnpm qa:stepper:report (writes apps/qa-playground/public/qa-reports/stepper-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  slider:
    'Run: pnpm qa:slider:report (writes apps/qa-playground/public/qa-reports/slider-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'touch-slider':
    'Run: pnpm qa:touch-slider:report (writes apps/qa-playground/public/qa-reports/touch-slider-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  icon:
    'Run: pnpm qa:icon:report (writes apps/qa-playground/public/qa-reports/icon-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'icon-button':
    'Run: pnpm qa:icon-button:report (writes apps/qa-playground/public/qa-reports/icon-button-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'icon-contained':
    'Run: pnpm qa:icon-contained:report (writes apps/qa-playground/public/qa-reports/icon-contained-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  image:
    'Run: pnpm qa:image:report (writes apps/qa-playground/public/qa-reports/image-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'selectable-button':
    'Run: pnpm qa:selectable-button:report (writes apps/qa-playground/public/qa-reports/selectable-button-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'single-text-button':
    'Run: pnpm qa:single-text-button:report (writes apps/qa-playground/public/qa-reports/single-text-button-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  chip:
    'Run: pnpm qa:chip:report (writes apps/qa-playground/public/qa-reports/chip-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'chip-group':
    'Run: pnpm qa:chip-group:report (writes apps/qa-playground/public/qa-reports/chip-group-summary.json), ensure dev server is apps/qa-playground (pnpm dev:qa-playground), then use Load Playwright report.',
  'circular-progress-indicator':
    'Run: pnpm qa:circular-progress-indicator:report (writes apps/qa-playground/public/qa-reports/circular-progress-indicator-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'bottom-navigation':
    'Run: pnpm qa:bottom-navigation:report (writes apps/qa-playground/public/qa-reports/bottom-navigation-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'radio-field':
    'Run: pnpm qa:radio-field:report (writes apps/qa-playground/public/qa-reports/radio-field-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  pagination:
    'Run: pnpm qa:pagination:report (writes apps/qa-playground/public/qa-reports/pagination-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'pagination-dots':
    'Run: pnpm qa:pagination-dots:report (writes apps/qa-playground/public/qa-reports/pagination-dots-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  tabs:
    'Run: pnpm qa:tabs:report (writes apps/qa-playground/public/qa-reports/tabs-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'web-header':
    'Run: pnpm qa:web-header:report (writes apps/qa-playground/public/qa-reports/web-header-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  input:
    'Run: pnpm qa:input:report (writes apps/qa-playground/public/qa-reports/input-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'input-dynamic-text':
    'Run: pnpm qa:input-dynamic-text:report (writes apps/qa-playground/public/qa-reports/input-dynamic-text-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'input-feedback':
    'Run: pnpm qa:input-feedback:report (writes apps/qa-playground/public/qa-reports/input-feedback-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'input-field':
    'Run: pnpm qa:input-field:report (writes apps/qa-playground/public/qa-reports/input-field-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'selectable-icon-button':
    'Run: pnpm qa:selectable-icon-button:report (writes apps/qa-playground/public/qa-reports/selectable-icon-button-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  'selectable-single-text-button':
    'Run: pnpm qa:selectable-single-text-button:report (writes apps/qa-playground/public/qa-reports/selectable-single-text-button-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  tooltip:
    'Run: pnpm qa:tooltip:report (writes apps/qa-playground/public/qa-reports/tooltip-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  modal:
    'Run: pnpm qa:modal:report (writes apps/qa-playground/public/qa-reports/modal-summary.json), ensure dev server is apps/qa-playground (e.g. pnpm dev:qa-playground), then use Load Playwright report.',
  'checkbox-field':
    'Run: pnpm qa:checkbox-field:report (writes apps/qa-playground/public/qa-reports/checkbox-field-summary.json), ensure dev server is apps/qa-playground, then use Load Playwright report.',
  native:
    'Run: pnpm qa:native:report (runs vitest + ingest, writes apps/qa-playground/public/qa-reports/native-summary.json). Reports smoke, functional, and a11y suites for React Native components.',
};

const QA_LOCATOR_LABEL: Record<QAPlaywrightSlug, string> = {
  button:
    'Vite: loads public/qa-reports/button-summary.json (run pnpm qa:button:report). Studio: use /components/qa/button — GET /api/components-qa/report/button.',
  checkbox: 'Vite: loads public/qa-reports/checkbox-summary.json (run pnpm qa:checkbox:report from repo root).',
  'counter-badge':
    'Vite: loads public/qa-reports/counter-badge-summary.json (run pnpm qa:counter-badge:report from repo root).',
  'indicator-badge':
    'Vite: loads public/qa-reports/indicator-badge-summary.json (run pnpm qa:indicator-badge:report from repo root).',
  avatar: 'Vite: loads public/qa-reports/avatar-summary.json (run pnpm qa:avatar:report from repo root).',
  badge: 'Vite: loads public/qa-reports/badge-summary.json (run pnpm qa:badge:report from repo root).',
  divider: 'Vite: loads public/qa-reports/divider-summary.json (run pnpm qa:divider:report from repo root).',
  radio: 'Vite: loads public/qa-reports/radio-summary.json (run pnpm qa:radio:report from repo root).',
  'radio-field':
    'Vite: loads public/qa-reports/radio-field-summary.json (run pnpm qa:radio-field:report from repo root).',
  switch: 'Vite: loads public/qa-reports/switch-summary.json (run pnpm qa:switch:report from repo root).',
  stepper: 'Vite: loads public/qa-reports/stepper-summary.json (run pnpm qa:stepper:report from repo root).',
  slider: 'Vite: loads public/qa-reports/slider-summary.json (run pnpm qa:slider:report from repo root).',
  'touch-slider':
    'Vite: loads public/qa-reports/touch-slider-summary.json (run pnpm qa:touch-slider:report from repo root).',
  icon: 'Vite: loads public/qa-reports/icon-summary.json (run pnpm qa:icon:report from repo root).',
  'icon-button':
    'Vite: loads public/qa-reports/icon-button-summary.json (run pnpm qa:icon-button:report from repo root).',
  'icon-contained':
    'Vite: loads public/qa-reports/icon-contained-summary.json (run pnpm qa:icon-contained:report from repo root).',
  image: 'Vite: loads public/qa-reports/image-summary.json (run pnpm qa:image:report from repo root).',
  'selectable-button':
    'Vite: loads public/qa-reports/selectable-button-summary.json (run pnpm qa:selectable-button:report from repo root).',
  'single-text-button':
    'Vite: loads public/qa-reports/single-text-button-summary.json (run pnpm qa:single-text-button:report from repo root).',
  chip: 'Vite: loads public/qa-reports/chip-summary.json (run pnpm qa:chip:report from repo root).',
  'chip-group': 'Vite: loads public/qa-reports/chip-group-summary.json (run pnpm qa:chip-group:report from repo root).',
  'circular-progress-indicator':
    'Vite: loads public/qa-reports/circular-progress-indicator-summary.json (run pnpm qa:circular-progress-indicator:report from repo root).',
  'bottom-navigation':
    'Vite: loads public/qa-reports/bottom-navigation-summary.json (run pnpm qa:bottom-navigation:report from repo root).',
  pagination: 'Vite: loads public/qa-reports/pagination-summary.json (run pnpm qa:pagination:report from repo root).',
  'pagination-dots':
    'Vite: loads public/qa-reports/pagination-dots-summary.json (run pnpm qa:pagination-dots:report from repo root).',
  tabs: 'Vite: loads public/qa-reports/tabs-summary.json (run pnpm qa:tabs:report from repo root).',
  'web-header':
    'Vite: loads public/qa-reports/web-header-summary.json (run pnpm qa:web-header:report from repo root).',
  input:
    'Vite: loads public/qa-reports/input-summary.json (run pnpm qa:input:report from repo root).',
  'input-dynamic-text':
    'Vite: loads public/qa-reports/input-dynamic-text-summary.json (run pnpm qa:input-dynamic-text:report from repo root).',
  'input-feedback':
    'Vite: loads public/qa-reports/input-feedback-summary.json (run pnpm qa:input-feedback:report from repo root).',
  'input-field':
    'Vite: loads public/qa-reports/input-field-summary.json (run pnpm qa:input-field:report from repo root).',
  'selectable-icon-button':
    'Vite: loads public/qa-reports/selectable-icon-button-summary.json (run pnpm qa:selectable-icon-button:report from repo root).',
  'selectable-single-text-button':
    'Vite: loads public/qa-reports/selectable-single-text-button-summary.json (run pnpm qa:selectable-single-text-button:report from repo root).',
  tooltip: 'Vite: loads public/qa-reports/tooltip-summary.json (run pnpm qa:tooltip:report from repo root).',
  modal: 'Vite: loads public/qa-reports/modal-summary.json (run pnpm qa:modal:report from repo root).',
  'checkbox-field': 'Vite: loads public/qa-reports/checkbox-field-summary.json (run pnpm qa:checkbox-field:report from repo root).',
  native: 'Vite: loads public/qa-reports/native-summary.json (run pnpm qa:native:report from repo root).',
};

const QA_ACCESSIBILITY_TAB_HINT: Record<QAPlaywrightSlug, string> = {
  avatar:
    'apps/qa-playground/e2e/avatar-accessibility.spec.ts (+ avatar-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:avatar:report.',
  badge:
    'apps/qa-playground/e2e/badge-accessibility.spec.ts (+ badge-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:badge:report.',
  checkbox:
    'apps/qa-playground/e2e/checkbox-accessibility.spec.ts (+ checkbox-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:checkbox:report.',
  'counter-badge':
    'apps/qa-playground/e2e/counter-badge-accessibility.spec.ts (+ counter-badge-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:counter-badge:report.',
  'indicator-badge':
    'apps/qa-playground/e2e/indicator-badge-accessibility.spec.ts (+ indicator-badge-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:indicator-badge:report.',
  button: 'apps/qa-playground/e2e/button-qa.spec.ts — @axe-core/playwright (WCAG 2.0 / 2.1 AA tags).',
  divider:
    'apps/qa-playground/e2e/divider-accessibility.spec.ts (+ divider-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:divider:report.',
  radio:
    'apps/qa-playground/e2e/radio-accessibility.spec.ts (+ radio-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:radio:report.',
  'radio-field':
    'apps/qa-playground/e2e/radio-field-accessibility.spec.ts (+ radio-field-qa.spec.ts) — run pnpm qa:radio-field:report.',
  switch: 'apps/qa-playground/e2e/switch-qa.spec.ts — @axe-core/playwright (WCAG 2.0 / 2.1 AA tags).',
  stepper:
    'apps/qa-playground/e2e/stepper-accessibility.spec.ts (+ stepper-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:stepper:report.',
  slider:
    'apps/qa-playground/e2e/slider-accessibility.spec.ts (+ slider-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:slider:report.',
  'touch-slider':
    'apps/qa-playground/e2e/touch-slider-accessibility.spec.ts (+ touch-slider-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:touch-slider:report.',
  icon:
    'apps/qa-playground/e2e/icon-accessibility.spec.ts (+ icon-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:icon:report.',
  'icon-button':
    'apps/qa-playground/e2e/icon-button-accessibility.spec.ts (+ icon-button-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:icon-button:report.',
  'icon-contained':
    'apps/qa-playground/e2e/icon-contained-accessibility.spec.ts (+ icon-contained-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:icon-contained:report.',
  image:
    'apps/qa-playground/e2e/image-accessibility.spec.ts (+ image-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:image:report.',
  'selectable-button':
    'apps/qa-playground/e2e/selectable-button-accessibility.spec.ts (+ selectable-button-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:selectable-button:report.',
  'single-text-button':
    'apps/qa-playground/e2e/single-text-button-accessibility.spec.ts (+ single-text-button-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:single-text-button:report.',
  chip:
    'apps/qa-playground/e2e/chip-accessibility.spec.ts (+ chip-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:chip:report.',
  'chip-group':
    'apps/qa-playground/e2e/chip-group-accessibility.spec.ts (+ chip-group-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:chip-group:report.',
  'circular-progress-indicator':
    'apps/qa-playground/e2e/circular-progress-indicator-accessibility.spec.ts (+ circular-progress-indicator-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:circular-progress-indicator:report.',
  'bottom-navigation':
    'apps/qa-playground/e2e/bottom-navigation-accessibility.spec.ts (+ bottom-navigation-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:bottom-navigation:report.',
  pagination:
    'apps/qa-playground/e2e/pagination-accessibility.spec.ts (+ pagination-qa.spec.ts functional/keyboard/visual) — @axe-core/playwright; run pnpm --filter @oneui/qa-playground qa:pagination:report.',
  'pagination-dots':
    'apps/qa-playground/e2e/pagination-dots-accessibility.spec.ts (+ pagination-dots-qa.spec.ts functional/keyboard/visual) — @axe-core/playwright; run pnpm --filter @oneui/qa-playground qa:pagination-dots:report.',
  tabs:
    'apps/qa-playground/e2e/tabs-accessibility.spec.ts (+ tabs-qa.spec.ts functional/keyboard/focus) — @axe-core/playwright; run pnpm --filter @oneui/qa-playground qa:tabs:report.',
  'web-header':
    'apps/qa-playground/e2e/web-header-accessibility.spec.ts (+ web-header-qa.spec.ts functional/responsive/figma) — @axe-core/playwright; run pnpm --filter @oneui/qa-playground qa:web-header:report.',
  input:
    'apps/qa-playground/e2e/input-accessibility.spec.ts (+ input-qa.spec.ts functional/typing/keyboard) — @axe-core/playwright; run pnpm --filter @oneui/qa-playground qa:input:report.',
  'input-dynamic-text':
    'apps/qa-playground/e2e/input-dynamic-text-accessibility.spec.ts (+ input-dynamic-text-qa.spec.ts) — @axe-core/playwright; run pnpm --filter @oneui/qa-playground qa:input-dynamic-text:report.',
  'input-feedback':
    'apps/qa-playground/e2e/input-feedback-accessibility.spec.ts (+ input-feedback-qa.spec.ts) — @axe-core/playwright; run pnpm --filter @oneui/qa-playground qa:input-feedback:report.',
  'input-field':
    'apps/qa-playground/e2e/input-field-accessibility.spec.ts (+ input-field-qa.spec.ts) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:input-field:report.',
  'selectable-icon-button':
    'apps/qa-playground/e2e/selectable-icon-button-accessibility.spec.ts (+ selectable-icon-button-qa.spec.ts) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:selectable-icon-button:report.',
  'selectable-single-text-button':
    'apps/qa-playground/e2e/selectable-single-text-button-accessibility.spec.ts (+ selectable-single-text-button-qa.spec.ts) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:selectable-single-text-button:report.',
  tooltip:
    'apps/qa-playground/e2e/tooltip-accessibility.spec.ts (+ tooltip-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:tooltip:report.',
  modal:
    'apps/qa-playground/e2e/modal-qa.spec.ts — @axe-core/playwright (WCAG 2.0 / 2.1 AA tags) + dialog-open-state tests; run pnpm --filter @oneui/qa-playground qa:modal:report.',
  'checkbox-field':
    'apps/qa-playground/e2e/checkbox-field-accessibility.spec.ts (+ checkbox-field-qa.spec.ts functional) — @axe-core/playwright + axe-html-reporter; run pnpm --filter @oneui/qa-playground qa:checkbox-field:report.',
};

async function parseJsonReport(res: Response): Promise<QAPlaywrightRunResponse> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) {
    throw new Error(`Expected JSON, got (${res.status}): ${trimmed.slice(0, 160)}…`);
  }
  return JSON.parse(trimmed) as QAPlaywrightRunResponse;
}

function mockPlaywrightStub(slug: string): QAPlaywrightRunResponse {
  const suites: QAPlaywrightRunResponse['suites'] = {};
  for (const id of ['functional', 'accessibility', 'performance'] as const) {
    suites[id] = {
      suite: id,
      passed: 0,
      failed: 0,
      skipped: 0,
      logs: [
        'Standalone app — no API server.',
        'Run: pnpm --filter @oneui/ui test:playwright (from monorepo root), then ingest JSON into this UI.',
        `Component filter: ${slug}`,
      ],
      errors: [],
      traceHint: 'packages/ui/playwright-report after a local run',
      screenshotHint: 'packages/ui/test-results on failures',
    };
  }
  return {
    ok: true,
    slug,
    message:
      'Stub report — wire your agent/CI to POST results or read artefacts from disk in a small backend.',
    suites,
  };
}

export function ComponentDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const meta = useMemo(() => getMetaBySlug(slug), [slug]);

  if (!meta) {
    return <Navigate to="/" replace />;
  }

  return <ComponentDetailInner meta={meta} />;
}

function ComponentDetailInner({ meta }: { meta: NonNullable<ReturnType<typeof getMetaBySlug>> }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>('scenarios');
  const [runLoading, setRunLoading] = useState(false);
  const [lastRun, setLastRun] = useState<QAPlaywrightRunResponse | null>(null);
  const [reportHistory, setReportHistory] = useState<readonly QAPlaywrightHistoryEntry[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const testRun = useQaComponentTestRun();
  const { runTests: runComponentTests, isComplete: testRunComplete } = testRun;

  useEffect(() => {
    if (tab === 'figma' && !slugHasFigmaValidationTab(meta.slug)) {
      setTab('scenarios');
    }
    if (tab === 'dividerFigmaValidation' && meta.slug !== 'divider') {
      setTab('scenarios');
    }
    if (tab === 'radioFigmaValidation' && meta.slug !== 'radio') {
      setTab('scenarios');
    }
    if (tab === 'radioFieldFigmaValidation' && meta.slug !== 'radio-field') {
      setTab('scenarios');
    }
    if (tab === 'inputFeedbackFigmaValidation' && meta.slug !== 'input-feedback') {
      setTab('scenarios');
    }
    if (tab === 'inputFieldFigmaValidation' && meta.slug !== 'input-field') {
      setTab('scenarios');
    }
  }, [meta.slug, tab]);

  const loadReport = useCallback(async () => {
    setRunLoading(true);
    try {
      if (isQaPlaywrightSlug(meta.slug)) {
        const cacheBust = Date.now();
        const summaryUrl = qaPlaywrightReportUrl(meta.slug, cacheBust);
        const historyUrl = qaPlaywrightReportHistoryUrl(meta.slug, cacheBust);
        const [summaryRes, historyRes] = await Promise.all([
          fetch(summaryUrl, { cache: 'no-store' }),
          fetch(historyUrl, { cache: 'no-store' }),
        ]);
        if (!summaryRes.ok) {
          throw new Error(`HTTP ${summaryRes.status} for ${summaryUrl}`);
        }
        const json = await parseJsonReport(summaryRes);
        if (!json.suites?.accessibility || !json.suites?.functional) {
          throw new Error('Report JSON is missing accessibility or functional suites.');
        }
        if (json.slug && json.slug !== meta.slug) {
          throw new Error(`Report slug mismatch: expected ${meta.slug}, got ${json.slug}`);
        }
        let previousRuns: readonly QAPlaywrightHistoryEntry[] = [];
        if (historyRes.ok) {
          const historyText = (await historyRes.text()).trim();
          if (historyText.startsWith('{')) {
            const parsed = parseHistoryFile(JSON.parse(historyText));
            if (parsed?.slug === meta.slug) {
              previousRuns = parsed.runs;
            }
          }
        }
        setLastRun(json);
        setReportHistory(previousRuns);
        setLastFetchedAt(new Date());
        setHasFetchedOnce(true);
        return;
      }
      setLastRun(mockPlaywrightStub(meta.slug));
      setLastFetchedAt(new Date());
      setHasFetchedOnce(true);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      const qaHint = isQaPlaywrightSlug(meta.slug) ? QA_LOAD_REPORT_HINT[meta.slug] : '';
      setLastRun({
        ok: false,
        slug: meta.slug,
        message: isQaPlaywrightSlug(meta.slug)
          ? `Could not load Playwright report. ${detail} — ${qaHint}`
          : `Could not load report for this component. ${detail}`,
      });
      setLastFetchedAt(new Date());
      setHasFetchedOnce(true);
    } finally {
      setRunLoading(false);
    }
  }, [meta.slug]);

  useEffect(() => {
    if (!isQaPlaywrightSlug(meta.slug)) return;
    void loadReport();
  }, [meta.slug, loadReport]);

  const handleRunTests = useCallback(async () => {
    if (!isQaPlaywrightSlug(meta.slug)) return;
    await runComponentTests(meta.slug);
  }, [meta.slug, runComponentTests]);

  useEffect(() => {
    if (testRunComplete) {
      void loadReport();
    }
  }, [loadReport, testRunComplete]);

  /** Re-fetch after Playwright ingest (Vite full-reload) or when returning to the tab. */
  useEffect(() => {
    if (!isQaPlaywrightSlug(meta.slug)) return;
    const onFocus = () => void loadReport();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [meta.slug, loadReport]);

  const Showcase = COMPONENT_QA_SHOWCASES[meta.slug];

  const detailTabs = useMemo((): ReadonlyArray<readonly [TabId, string]> => {
    const tabs: Array<[TabId, string]> = [['scenarios', 'Test Scenarios']];
    if (slugHasFigmaValidationTab(meta.slug)) {
      tabs.push(['figma', 'Figma Validation']);
    }
    tabs.push(['accessibility', 'Accessibility'], ['functional', 'Functional Tests']);
    if (meta.slug === 'divider') {
      tabs.push(['dividerFigmaValidation', 'Divider - Figma Validation']);
    }
    if (meta.slug === 'radio') {
      tabs.push(['radioFigmaValidation', 'Radio - Figma Validation']);
    }
    if (meta.slug === 'radio-field') {
      tabs.push(['radioFieldFigmaValidation', 'RadioField - Figma Validation']);
    }
    if (meta.slug === 'input-feedback') {
      tabs.push(['inputFeedbackFigmaValidation', 'InputFeedback - Figma Validation']);
    }
    if (meta.slug === 'input-field') {
      tabs.push(['inputFieldFigmaValidation', 'InputField - Figma Validation']);
    }
    return tabs;
  }, [meta.slug]);

  const wideTabPanel =
    tab === 'figma' ||
    tab === 'dividerFigmaValidation' ||
    tab === 'radioFigmaValidation' ||
    tab === 'radioFieldFigmaValidation' ||
    tab === 'inputFeedbackFigmaValidation' ||
    tab === 'inputFieldFigmaValidation';

  const tabPanelFullBleed = tab === 'figma' && meta.slug === 'segmented-control';

  const testStability = useMemo(() => {
    if (!isQaPlaywrightSlug(meta.slug)) return 'under-development' as const;
    if (!hasFetchedOnce) return null;
    return getComponentTestStability(meta.slug, lastRun);
  }, [hasFetchedOnce, lastRun, meta.slug]);

  return (
    <div className={detail.page}>
      <div className={detail.detailColumn}>
        <div className={detail.chromeHeader}>
        <Surface mode="elevated" as="header" className={detail.hero}>
          <Button
            contained={false}
            className={detail.backLink}
            variant="ghost"
            attention="low"
            size={8}
            start={
              <Icon icon="arrowLeft" size="4" appearance="primary" emphasis="tintedA11y" aria-hidden />
            }
            onClick={() => navigate('/')}
          >
            Components
          </Button>

          <div className={detail.heroMain}>
            <div className={detail.titleRow}>
              <Text as="h1" variant="headline" size="M">
                {meta.displayName}
              </Text>
              {testStability ? (
                <Badge
                  size="xs"
                  attention="medium"
                  appearance={
                    testStability === 'stable'
                      ? 'positive'
                      : testStability === 'unstable'
                        ? 'negative'
                        : 'neutral'
                  }
                  aria-label={
                    testStability === 'stable'
                      ? 'Stable — Playwright tests passing'
                      : testStability === 'unstable'
                        ? 'Unstable — has failed Playwright tests'
                        : 'Not Ready — Playwright tests not implemented yet'
                  }
                >
                  {testStability === 'stable'
                    ? 'Stable'
                    : testStability === 'unstable'
                      ? 'Unstable'
                      : 'Not Ready'}
                </Badge>
              ) : null}
            </div>

            <div className={detail.metaRow}>
              <Badge size="s" attention="medium" appearance="neutral" aria-label={`Component slug: ${meta.slug}`}>
                {meta.slug}
              </Badge>
              <Badge
                size="s"
                attention="medium"
                appearance="primary"
                aria-label={`Category: ${CATEGORY_FILTER_LABEL[meta.category]}`}
              >
                {CATEGORY_FILTER_LABEL[meta.category]}
              </Badge>
            </div>

            {meta.description ? (
              <Text variant="body" size="M" weight="low">
                {meta.description}
              </Text>
            ) : null}
          </div>

          <Divider attention="low" appearance="neutral" />

          <QaDetailReportSection
            componentName={meta.displayName}
            hasPlaywrightBundle={isQaPlaywrightSlug(meta.slug)}
            loading={runLoading}
            lastRun={lastRun}
            lastFetchedAt={lastFetchedAt}
            hasFetchedOnce={hasFetchedOnce}
            onLoad={loadReport}
            canRunTests={import.meta.env.DEV && isQaPlaywrightSlug(meta.slug)}
            testRun={testRun}
            onRunTests={() => void handleRunTests()}
          />

          {isQaPlaywrightSlug(meta.slug) ? (
            <>
              <Divider attention="low" appearance="neutral" />
              <Collapsible className={detail.devCollapsible}>
                <Collapsible.Trigger className={detail.devTrigger}>
                  <Text variant="label" size="S" weight="medium">
                    Report data source
                  </Text>
                </Collapsible.Trigger>
                <Collapsible.Panel>
                  <Text variant="code" size="S" weight="low">
                    {QA_LOCATOR_LABEL[meta.slug]}
                  </Text>
                </Collapsible.Panel>
              </Collapsible>
            </>
          ) : null}
        </Surface>

        <Surface mode="elevated" className={detail.tabsShell}>
          <TabGroup
            value={tab}
            onValueChange={(next) => setTab((next ?? 'scenarios') as TabId)}
            size="m"
            appearance="primary"
            className={detail.tabs}
            aria-label="Component QA sections"
          >
            {detailTabs.map(([id, label]) => {
              const tabIcon = QA_DETAIL_TAB_ICONS[id as QaDetailTabId];
              return (
                <TabItem
                  key={id}
                  value={id}
                  start={
                    tabIcon ? (
                      <Icon icon={tabIcon} size="4" appearance="neutral" emphasis="medium" aria-hidden />
                    ) : undefined
                  }
                >
                  {label}
                </TabItem>
              );
            })}
          </TabGroup>
        </Surface>
        </div>

        <Surface
          mode="default"
          className={detail.tabPanel}
          role="tabpanel"
          data-wide={wideTabPanel ? 'true' : undefined}
          data-full-bleed={tabPanelFullBleed ? 'true' : undefined}
        >
        <SurfaceAppearanceScope>
        {tab === 'scenarios' ? (
          <>
            {isQaPlaywrightSlug(meta.slug) ? null : (
              <Text variant="label" size="XS" weight="medium" className={detail.scenariosEyebrow}>
                Stories
              </Text>
            )}
            <Showcase />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'switch' ? <SwitchFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'stepper' ? <StepperFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'slider' ? (
          <>
            <SliderApiValidationShowcase />
            <SliderFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'select' ? (
          <>
            <SelectApiValidationShowcase />
            <SelectFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'touch-slider' ? (
          <>
            <TouchSliderApiValidationShowcase />
            <TouchSliderFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'tooltip' ? <TooltipFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'chip' ? <ChipFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'counter-badge' ? <CounterBadgeFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'indicator-badge' ? <IndicatorBadgeFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'chip-group' ? <ChipGroupFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'modal' ? <ModalFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'circular-progress-indicator' ? (
          <CircularProgressIndicatorFigmaValidationGrid />
        ) : null}

        {tab === 'figma' && meta.slug === 'bottom-navigation' ? <BottomNavigationFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'icon' ? (
          <>
            <IconApiValidationShowcase />
            <IconFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'icon-button' ? (
          <>
            <IconButtonApiValidationShowcase />
            <IconButtonFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'icon-contained' ? (
          <>
            <IconContainedApiValidationShowcase />
            <IconContainedFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'image' ? (
          <>
            <ImageApiValidationShowcase />
            <ImageFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'selectable-button' ? (
          <>
            <SelectableButtonApiValidationShowcase />
            <SelectableButtonFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'single-text-button' ? (
          <>
            <SingleTextButtonApiValidationShowcase />
            <SingleTextButtonFigmaValidationGrid />
          </>
        ) : null}

        {tab === 'figma' && meta.slug === 'segmented-control' ? (
          <SegmentedControlFigmaValidationGrid />
        ) : null}

        {tab === 'figma' && meta.slug === 'pagination' ? <PaginationFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'pagination-dots' ? <PaginationDotsFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'web-header' ? <WebHeaderFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'tabs' ? <TabsFigmaValidationGrid /> : null}

        {tab === 'figma' && meta.slug === 'checkbox-field' ? <CheckboxFieldFigmaValidationGrid /> : null}

        {tab === 'accessibility' ? (
          <QaReportDashboardWithHistory
            subjectName={meta.displayName}
            title="Accessibility"
            variant="accessibility"
            suiteId="accessibility"
            currentReport={lastRun}
            previousRuns={reportHistory}
            hint={
              isQaPlaywrightSlug(meta.slug)
                ? QA_ACCESSIBILITY_TAB_HINT[meta.slug]
                : 'Connect Playwright + @axe-core/playwright output for this slug when a report is wired.'
            }
            emptyHint={
              !lastRun?.suites?.accessibility
                ? 'No accessibility results yet — load the Playwright report above.'
                : undefined
            }
          />
        ) : null}

        {tab === 'functional' ? (
          <QaReportDashboardWithHistory
            subjectName={meta.displayName}
            title="Functional"
            variant="functional"
            suiteId="functional"
            currentReport={lastRun}
            previousRuns={reportHistory}
            hint={`DOM and interaction checks from apps/qa-playground/e2e/${meta.slug}-qa.spec.ts.`}
            emptyHint={
              !lastRun?.suites?.functional
                ? 'No functional results yet — load the Playwright report above.'
                : undefined
            }
          />
        ) : null}

        {tab === 'dividerFigmaValidation' && meta.slug === 'divider' ? <DividerFigmaValidationShowcase /> : null}

        {tab === 'radioFigmaValidation' && meta.slug === 'radio' ? <RadioFigmaValidationShowcase /> : null}

        {tab === 'radioFieldFigmaValidation' && meta.slug === 'radio-field' ? (
          <RadioFieldFigmaValidationShowcase />
        ) : null}

        {tab === 'inputFeedbackFigmaValidation' && meta.slug === 'input-feedback' ? (
          <InputFeedbackFigmaValidationShowcase />
        ) : null}

        {tab === 'inputFieldFigmaValidation' && meta.slug === 'input-field' ? (
          <InputFieldFigmaValidationShowcase />
        ) : null}
        </SurfaceAppearanceScope>
        </Surface>
      </div>
    </div>
  );
}
