'use client';

import { useId } from 'react';
import { InputFeedback } from '@oneui/ui/components/Input';
import type { InputFeedbackAttention, InputFeedbackSize, InputFeedbackVariant } from '@oneui/ui/components/Input';
import { Icon } from '@oneui/ui/components/Icon';
import {
  IFB_FIGMA_ATTENTION_COLS,
  IFB_FIGMA_DNA_PATH,
  IFB_FIGMA_GRID_TESTID,
  IFB_FIGMA_MATRIX_MESSAGE,
  IFB_FIGMA_MATRIX_ROWS,
  IFB_FIGMA_SPEC_DESCRIPTION,
  IFB_FIGMA_VALIDATION_SECTION_ID,
  ifbFigmaCellTestId,
} from './inputFeedbackFigmaValidation.shared';
import figmaStyles from './InputFeedbackFigmaValidationShowcase.module.css';

function FigmaInputFeedbackCell({
  variant,
  size,
  attention,
  testId,
}: {
  variant: InputFeedbackVariant;
  size: InputFeedbackSize;
  attention: InputFeedbackAttention;
  testId: string;
}) {
  return (
    <div data-testid={testId} className={figmaStyles.cellAnchor}>
      <InputFeedback
        variant={variant}
        size={size}
        attention={attention}
        feedback_message={IFB_FIGMA_MATRIX_MESSAGE}
      />
    </div>
  );
}

/**
 * InputFeedback Figma validation — one COMPONENT_SET grid matching Figma node 3450:1388:
 * columns = attention (low · medium · high), rows = type × size (M, S, L per type), labels on the right.
 */
export function InputFeedbackFigmaValidationShowcase() {
  const reactId = useId().replace(/:/g, '');
  const sectionHeadingId = `${IFB_FIGMA_VALIDATION_SECTION_ID}__heading-${reactId}`;

  return (
    <div className={figmaStyles.page} data-testid="input-feedback-figma-validation-root">
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
          <h2 className={figmaStyles.specTitle}>InputFeedback</h2>
        </div>
        <p className={figmaStyles.specDescription}>{IFB_FIGMA_SPEC_DESCRIPTION}</p>
        <p className={figmaStyles.specDnaPath}>
          <span className={figmaStyles.specDnaMark} aria-hidden>
            ❖
          </span>
          {IFB_FIGMA_DNA_PATH}
        </p>
      </header>

      <section
        id={IFB_FIGMA_VALIDATION_SECTION_ID}
        data-section={IFB_FIGMA_VALIDATION_SECTION_ID}
        aria-labelledby={sectionHeadingId}
        className={figmaStyles.matrixSection}
      >
        <div
          className={figmaStyles.tableWrap}
          tabIndex={0}
          role="region"
          aria-label="InputFeedback Figma validation matrix"
        >
          <table className={figmaStyles.gridTable} data-testid={IFB_FIGMA_GRID_TESTID}>
            <caption id={sectionHeadingId} className={figmaStyles.figmaCaption}>
              <span className={figmaStyles.figmaCaptionMark} aria-hidden>
                ❖
              </span>{' '}
              InputFeedback
            </caption>
            <tbody>
              {IFB_FIGMA_MATRIX_ROWS.map(({ variant, size, sizeLabel, isFirstInType }) => (
                <tr
                  key={`${variant}-${sizeLabel}`}
                  data-testrow={`type-${variant}-size-${sizeLabel}`}
                  className={isFirstInType && variant !== 'negative' ? figmaStyles.typeBandStart : undefined}
                >
                  {IFB_FIGMA_ATTENTION_COLS.map((attention) => {
                    const testId = ifbFigmaCellTestId(variant, sizeLabel, attention);
                    return (
                      <td key={attention} className={figmaStyles.cell}>
                        <div className={figmaStyles.cellInner}>
                          <FigmaInputFeedbackCell
                            variant={variant}
                            size={size}
                            attention={attention}
                            testId={testId}
                          />
                        </div>
                      </td>
                    );
                  })}
                  <th scope="row" className={figmaStyles.rowLabelRight}>
                    {isFirstInType ? (
                      <span className={figmaStyles.rowTypeLabel}>type: {variant}</span>
                    ) : null}
                    <span className={figmaStyles.rowSizeLabel}>size: {sizeLabel}</span>
                  </th>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={figmaStyles.footerRow}>
                {IFB_FIGMA_ATTENTION_COLS.map((attention) => (
                  <td key={attention} className={figmaStyles.footerAttention}>
                    attention: {attention}
                  </td>
                ))}
                <td className={figmaStyles.footerCorner} aria-hidden />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
