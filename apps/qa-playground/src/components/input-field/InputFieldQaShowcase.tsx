'use client';

import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import { InputFieldScenarioGrid } from './InputFieldScenarioGrid';
import { INPUT_FIELD_QA_SECTIONS } from './inputFieldQaScenarios';
import { InputFieldControlsPanel } from './InputFieldControlsPanel';

/**
 * InputField QA — `/c/input-field`
 * Real `@oneui/ui` InputField · `data-testid` on QA wrapper per scenario.
 * Bare `Input` control: `/c/input`.
 * Figma size matrix (M · S · L): {@link InputFieldFigmaValidationShowcase} (separate tab).
 */
export function InputFieldQaShowcase() {
  return (
    <QaShowcaseRoot>
      {INPUT_FIELD_QA_SECTIONS.map((section, index) => (
        <QaStoryBand
          key={section.id}
          id={section.id}
          title={section.title}
          centerContent={section.scenarios.length === 1 && index === 0}
          overflow={
            section.id === 'input-field-qa-pairwise' || section.id === 'input-field-qa-appearance'
          }
        >
          <QaApiSectionBody
            scrollable={
              section.id === 'input-field-qa-pairwise' || section.id === 'input-field-qa-appearance'
            }
            scrollableRegionLabel={
              section.id === 'input-field-qa-pairwise'
                ? 'InputField pairwise 2×2 matrix'
                : section.id === 'input-field-qa-appearance'
                  ? 'InputField appearance roles'
                  : undefined
            }
          >
            <InputFieldScenarioGrid
              scenarios={section.scenarios}
              layout={
                section.id === 'input-field-qa-pairwise' || section.id === 'input-field-qa-appearance'
                  ? 'stack'
                  : 'flex'
              }
            />
          </QaApiSectionBody>
        </QaStoryBand>
      ))}

      <QaStoryBand id="input-field-qa-controls" title="14 Controls panel" overflow>
        <QaApiSectionBody>
          <InputFieldControlsPanel />
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
