'use client';

import { useState, type ReactNode } from 'react';
import { InputDynamicText } from '@oneui/ui/components/Input';
import type { InputDynamicTextProps, InputLabelSize } from '@oneui/ui/components/Input';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

function InputDynamicTextPreviewFrame({ children }: { children: ReactNode }) {
  return <div className={styles.inputDynamicTextPreviewFrame}>{children}</div>;
}

const FIGMA_SIZES: { figma: string; size: InputLabelSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

type ContentEndPreset = 'both' | 'content' | 'end' | 'none';

function propsForContentEnd(preset: ContentEndPreset): Pick<InputDynamicTextProps, 'content' | 'end'> {
  switch (preset) {
    case 'both':
      return { content: 'Dynamic text', end: 'Helper Button' };
    case 'content':
      return { content: '0 / 100 characters' };
    case 'end':
      return { end: 'Helper Button' };
    case 'none':
      return {};
  }
}

const CONTENT_END_PRESETS: { preset: ContentEndPreset; caption: string }[] = [
  { preset: 'both', caption: 'content: Text · end: Button' },
  { preset: 'content', caption: 'content: Text · end: none' },
  { preset: 'end', caption: 'content: none · end: Button' },
  { preset: 'none', caption: 'content: none · end: none (renders null) ⚠️' },
];

type ComboRow = {
  caption: string;
  props: InputDynamicTextProps;
  testId: string;
};

const COMBO_MATRIX: ComboRow[] = (['s', 'm', 'l'] as const).flatMap((size) =>
  (['both', 'content', 'end'] as const).map((preset) => ({
    caption: `size ${size.toUpperCase()} · ${preset}`,
    props: { size, ...propsForContentEnd(preset) },
    testId: `idt-combo-${size}-${preset}`,
  })),
);

function EndClickDemo() {
  const [count, setCount] = useState(0);
  return (
    <InputDynamicText
      size="m"
      content={`Clicked ${count} time(s)`}
      end="Increment"
      onEndClick={() => setCount((c) => c + 1)}
      data-testid="idt-end-click"
    />
  );
}

/**
 * InputDynamicText QA — Figma DynamicText API (`/c/input-dynamic-text`).
 */
export function InputDynamicTextQaShowcase() {
  return (
    <QaShowcaseRoot>
      <QaStoryBand id="idt-qa-default" title="Default" overflow>
        <QaApiSectionBody>
          <InputDynamicTextPreviewFrame>
            <InputDynamicText
              size="m"
              content="0 / 280 characters"
              end="Helper Button"
              data-testid="idt-default"
            />
          </InputDynamicTextPreviewFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="idt-qa-size" title="1 Size (S · M · L)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCellWide}>
                <div className={styles.scenarioWidePreviewWrap}>
                  <InputDynamicTextPreviewFrame>
                    <InputDynamicText
                      size={size}
                      content="Dynamic text"
                      end="Helper Button"
                      data-testid={`idt-size-${figma}`}
                    />
                  </InputDynamicTextPreviewFrame>
                </div>
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="idt-qa-content-end" title="2 Content × end (Figma slots)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {CONTENT_END_PRESETS.map(({ preset, caption }) => (
              <div key={preset} className={styles.scenarioLabeledCellWide}>
                <div className={styles.scenarioWidePreviewWrap}>
                  <InputDynamicTextPreviewFrame>
                    <InputDynamicText
                      size="m"
                      {...propsForContentEnd(preset)}
                      data-testid={`idt-slot-${preset}`}
                    />
                  </InputDynamicTextPreviewFrame>
                </div>
                <span className={styles.scenarioCellCaption}>{caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="idt-qa-states" title="3 States & behaviour" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <div className={styles.scenarioWidePreviewWrap}>
                <InputDynamicTextPreviewFrame>
                  <InputDynamicText
                    size="m"
                    content="Disabled row"
                    end="Action"
                    disabled
                    data-testid="idt-disabled"
                  />
                </InputDynamicTextPreviewFrame>
              </div>
              <span className={styles.scenarioCellCaption}>disabled: true</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div className={styles.scenarioWidePreviewWrap}>
                <InputDynamicTextPreviewFrame>
                  <InputDynamicText
                    size="m"
                    content="Live region copy"
                    end="Clear"
                    aria-live="polite"
                    data-testid="idt-aria-live-polite"
                  />
                </InputDynamicTextPreviewFrame>
              </div>
              <span className={styles.scenarioCellCaption}>aria-live: polite (content)</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div className={styles.scenarioWidePreviewWrap}>
                <InputDynamicTextPreviewFrame>
                  <InputDynamicText
                    size="m"
                    content="Custom name"
                    end="Go"
                    endAriaLabel="Submit helper action"
                    data-testid="idt-end-aria-label"
                  />
                </InputDynamicTextPreviewFrame>
              </div>
              <span className={styles.scenarioCellCaption}>endAriaLabel override</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <div className={styles.scenarioWidePreviewWrap}>
                <InputDynamicTextPreviewFrame>
                  <EndClickDemo />
                </InputDynamicTextPreviewFrame>
              </div>
              <span className={styles.scenarioCellCaption}>onEndClick handler</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="idt-qa-combos" title="4 Combination matrix (size × slots)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {COMBO_MATRIX.map((row) => (
              <div key={row.testId} className={styles.scenarioLabeledCellWide}>
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
                <div className={styles.scenarioWidePreviewWrap}>
                  <InputDynamicTextPreviewFrame>
                    <InputDynamicText {...row.props} data-testid={row.testId} />
                  </InputDynamicTextPreviewFrame>
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
