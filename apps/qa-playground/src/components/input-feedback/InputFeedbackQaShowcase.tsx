'use client';

import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import { InputFeedbackScenarioGrid } from './InputFeedbackScenarioGrid';
import { INPUT_FEEDBACK_QA_SECTIONS } from './inputFeedbackQaScenarios';
import { InputFeedbackControlsPanel } from './InputFeedbackControlsPanel';

/**
 * InputFeedback QA — `/c/input-feedback`
 * Real `@oneui/ui` InputFeedback · `data-testid` on QA wrapper per scenario.
 * Full Figma COMPONENT_SET matrix: {@link InputFeedbackFigmaValidationShowcase} (separate tab).
 */
export function InputFeedbackQaShowcase() {
  return (
    <QaShowcaseRoot>
      {INPUT_FEEDBACK_QA_SECTIONS.map((section, index) => (
        <QaStoryBand
          key={section.id}
          id={section.id}
          title={section.title}
          centerContent={section.scenarios.length === 1 && index === 0}
          overflow={section.id === 'input-feedback-qa-matrix'}
        >
          <QaApiSectionBody
            scrollable={section.id === 'input-feedback-qa-matrix'}
            scrollableRegionLabel="InputFeedback variant × attention matrix"
          >
            <InputFeedbackScenarioGrid
              scenarios={section.scenarios}
              layout={
                section.id === 'input-feedback-qa-matrix'
                  ? 'matrix'
                  : section.id === 'input-feedback-qa-combos'
                    ? 'stack'
                    : 'flex'
              }
            />
          </QaApiSectionBody>
        </QaStoryBand>
      ))}

      <QaStoryBand id="input-feedback-qa-controls" title="9 Controls panel" overflow>
        <QaApiSectionBody>
          <InputFeedbackControlsPanel />
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
