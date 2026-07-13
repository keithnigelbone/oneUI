'use client';

import type { CSSProperties } from 'react';
import type { RadioFieldProps } from '@oneui/ui/components/RadioField';
import { RadioField } from '@oneui/ui/components/RadioField';
import type { RadioFieldMountScenario } from './radioFieldQaScenarios';
import styles from '../../styles/qa.module.css';

const fieldAnchorStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
};

type RadioFieldQaAnchorProps = RadioFieldProps & {
  'data-testid': string;
};

function RadioFieldQaAnchor({ 'data-testid': testId, ...props }: RadioFieldQaAnchorProps) {
  return (
    <div data-testid={testId} style={fieldAnchorStyle}>
      {/* TODO: forward data-testid to Field.Root when RadioField supports it */}
      <RadioField {...props} />
    </div>
  );
}

type RadioFieldScenarioGridProps = {
  scenarios: readonly RadioFieldMountScenario[];
  layout?: 'flex' | 'combo';
};

export function RadioFieldScenarioGrid({ scenarios, layout = 'flex' }: RadioFieldScenarioGridProps) {
  const gridClass = layout === 'combo' ? styles.scenarioComboGrid : styles.scenarioFlexRow;
  return (
    <div className={gridClass}>
      {scenarios.map((scenario) => (
        <div key={scenario.testId} className={styles.scenarioLabeledCell}>
          <RadioFieldQaAnchor data-testid={scenario.testId} {...scenario.props} />
          <span className={styles.scenarioCellCaption}>{scenario.caption}</span>
        </div>
      ))}
    </div>
  );
}

export { RadioFieldQaAnchor };
