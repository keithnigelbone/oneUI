'use client';

import type { CSSProperties } from 'react';
import { InputField } from '@oneui/ui/components/InputField';
import type { InputFieldProps } from '@oneui/ui/components/InputField';
import type { InputFieldMountScenario } from './inputFieldQaScenarios';
import styles from '../../styles/qa.module.css';

const anchorStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
};

type InputFieldQaAnchorProps = InputFieldProps & {
  'data-testid': string;
};

function InputFieldQaAnchor({ 'data-testid': testId, ...props }: InputFieldQaAnchorProps) {
  return (
    <div data-testid={testId} className={styles.inputFieldPreviewFrame} style={anchorStyle}>
      <InputField {...props} />
    </div>
  );
}

type InputFieldScenarioGridProps = {
  scenarios: readonly InputFieldMountScenario[];
  layout?: 'flex' | 'stack';
};

export function InputFieldScenarioGrid({ scenarios, layout = 'flex' }: InputFieldScenarioGridProps) {
  const gridClass = layout === 'stack' ? styles.scenarioStackWide : styles.scenarioFlexRow;

  return (
    <div className={gridClass}>
      {scenarios.map((scenario) => (
        <div
          key={scenario.testId}
          className={layout === 'stack' ? styles.scenarioLabeledCellWide : styles.scenarioLabeledCell}
        >
          <InputFieldQaAnchor data-testid={scenario.testId} {...scenario.props} />
        </div>
      ))}
    </div>
  );
}

export { InputFieldQaAnchor };
