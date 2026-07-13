'use client';

import { useId } from 'react';
import { InputField } from '@oneui/ui/components/InputField';
import { Icon } from '@oneui/ui/components/Icon';
import {
  IFF_FIGMA_DNA_PATH,
  IFF_FIGMA_GRID_TESTID,
  IFF_FIGMA_LABEL,
  IFF_FIGMA_PLACEHOLDER,
  IFF_FIGMA_SIZE_ROWS,
  IFF_FIGMA_SPEC_DESCRIPTION,
  IFF_FIGMA_VALIDATION_ROOT_TESTID,
  IFF_FIGMA_VALIDATION_SECTION_ID,
  iffFigmaCellTestId,
} from './inputFieldFigmaValidation.shared';
import figmaStyles from './InputFieldFigmaValidationShowcase.module.css';

/** Leading icon — Figma spec (heart). */
const FIGMA_START_ICON = <Icon icon="heart" size="4" appearance="primary" emphasis="high" aria-hidden />;

/** Trailing icon — Figma spec (microphone). */
const FIGMA_END_ICON = <Icon icon="microphone" size="4" appearance="primary" emphasis="high" aria-hidden />;

function FigmaInputFieldCell({
  size,
  testId,
}: {
  size: (typeof IFF_FIGMA_SIZE_ROWS)[number]['size'];
  testId: string;
}) {
  return (
    <div data-testid={testId} className={figmaStyles.cellAnchor}>
      <InputField
        size={size}
        label={IFF_FIGMA_LABEL}
        placeholder={IFF_FIGMA_PLACEHOLDER}
        start={FIGMA_START_ICON}
        end={FIGMA_END_ICON}
        appearance="primary"
        attention="medium"
        shape="default"
      />
    </div>
  );
}

/**
 * InputField Figma validation — size COMPONENT_SET (M, S, L) matching attached Figma frame:
 * label + bordered input + start (heart) + placeholder + end (microphone); size labels on the right.
 */
export function InputFieldFigmaValidationShowcase() {
  const reactId = useId().replace(/:/g, '');
  const sectionHeadingId = `${IFF_FIGMA_VALIDATION_SECTION_ID}__heading-${reactId}`;

  return (
    <div className={figmaStyles.page} data-testid={IFF_FIGMA_VALIDATION_ROOT_TESTID}>
      <header className={figmaStyles.specHeader}>
        <div className={figmaStyles.specTitleRow}>
          <Icon
            icon="info"
            size="8"
            appearance="sparkle"
            emphasis="high"
            className={figmaStyles.specIcon}
            aria-hidden
          />
          <h2 className={figmaStyles.specTitle}>InputField</h2>
        </div>
        <p className={figmaStyles.specDescription}>{IFF_FIGMA_SPEC_DESCRIPTION}</p>
        <p className={figmaStyles.specDnaPath}>
          <span className={figmaStyles.specDnaMark} aria-hidden>
            ❖
          </span>
          {IFF_FIGMA_DNA_PATH}
        </p>
      </header>

      <section
        id={IFF_FIGMA_VALIDATION_SECTION_ID}
        data-section={IFF_FIGMA_VALIDATION_SECTION_ID}
        aria-labelledby={sectionHeadingId}
        className={figmaStyles.matrixSection}
      >
        <div
          className={figmaStyles.tableWrap}
          tabIndex={0}
          role="region"
          aria-label="InputField Figma validation matrix"
        >
          <table className={figmaStyles.gridTable} data-testid={IFF_FIGMA_GRID_TESTID}>
            <caption id={sectionHeadingId} className={figmaStyles.figmaCaption}>
              <span className={figmaStyles.figmaCaptionMark} aria-hidden>
                ❖
              </span>{' '}
              InputField
            </caption>
            <tbody>
              {IFF_FIGMA_SIZE_ROWS.map(({ size, label }) => {
                const testId = iffFigmaCellTestId(label);
                return (
                  <tr key={label} data-testrow={`size-${label}`}>
                    <td className={figmaStyles.cell}>
                      <div className={figmaStyles.cellInner}>
                        <FigmaInputFieldCell size={size} testId={testId} />
                      </div>
                    </td>
                    <th scope="row" className={figmaStyles.rowLabelRight}>
                      <span className={figmaStyles.rowSizeLabel}>size: {label}</span>
                    </th>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
