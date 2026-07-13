'use client';

import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';
import { RadioFieldScenarioGrid } from './RadioFieldScenarioGrid';
import { RADIO_FIELD_QA_SECTIONS } from './radioFieldQaScenarios';

/**
 * RadioField QA validation page — one mount per feature, integrated single by default.
 * Real `@oneui/ui` RadioField · `data-testid` on QA wrapper only.
 *
 * Figma mapping: require→required · infoIcon→infoIconSlot · label/labelText→`label` string.
 * Band 2 combines size M, appearance secondary, checked, label, description, required, infoIcon, feedback, dynamicText.
 * accent is not on RadioField — lone `Radio` child in band 15 only ⚠️
 */
export function RadioFieldQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      {RADIO_FIELD_QA_SECTIONS.map((section, index) => (
        <QaStoryBand
          key={section.id}
          id={section.id}
          title={section.title}
          centerContent={section.scenarios.length === 1 && index === 0}
        >
          {section.lead ? <p className={styles.storySectionLead}>{section.lead}</p> : null}
          <QaApiSectionBody>
            <RadioFieldScenarioGrid scenarios={section.scenarios} />
          </QaApiSectionBody>
        </QaStoryBand>
      ))}
    </QaShowcaseRoot>
  );
}
