'use client';

import type { CSSProperties } from 'react';
import { InputFeedback } from '@oneui/ui/components/Input';
import type { InputFeedbackProps } from '@oneui/ui/components/Input';
import type { InputFeedbackMountScenario } from './inputFeedbackQaScenarios';
import styles from '../../styles/qa.module.css';

const anchorStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
};

type InputFeedbackQaAnchorProps = InputFeedbackProps & {
  'data-testid': string;
};

function InputFeedbackQaAnchor({ 'data-testid': testId, ...props }: InputFeedbackQaAnchorProps) {
  return (
    <div data-testid={testId} className={styles.inputFeedbackPreviewFrame} style={anchorStyle}>
      <InputFeedback {...props} />
    </div>
  );
}

type InputFeedbackScenarioGridProps = {
  scenarios: readonly InputFeedbackMountScenario[];
  layout?: 'flex' | 'stack' | 'matrix';
};

export function InputFeedbackScenarioGrid({
  scenarios,
  layout = 'flex',
}: InputFeedbackScenarioGridProps) {
  const gridClass =
    layout === 'matrix'
      ? styles.scenarioComboGrid
      : layout === 'stack'
        ? styles.scenarioStackWide
        : styles.scenarioFlexRow;

  return (
    <div className={gridClass}>
      {scenarios.map((scenario) => (
        <div
          key={scenario.testId}
          className={layout === 'stack' || layout === 'matrix' ? styles.scenarioLabeledCellWide : styles.scenarioLabeledCell}
        >
          <InputFeedbackQaAnchor data-testid={scenario.testId} {...scenario.props} />
        </div>
      ))}
    </div>
  );
}

export { InputFeedbackQaAnchor };
