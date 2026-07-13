'use client';

import { Slider } from '@oneui/ui/components/Slider';
import type { SliderAppearance, SliderKnobStyle } from '@oneui/ui/components/Slider';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import styles from './SliderApiValidationShowcase.module.css';

const TRACK_WIDTH = 328;

/** Figma API table order (attached spec) + `auto`. */
const FIGMA_APPEARANCE_ORDER: readonly SliderAppearance[] = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

const SHARED_TYPES_NOTE =
  '`SliderAppearance` is `ComponentAppearance` from `@oneui/shared` (includes `brand-bg` not listed on the attached Figma API screenshot).';

/**
 * Figma **API Table** ↔ shipped `Slider` / `SliderProps` (`packages/ui/src/components/Slider/Slider.shared.ts`).
 * Live controls in the **Demo** column use the real `Slider` from `@oneui/ui`.
 */
export function SliderApiValidationShowcase() {
  const appearanceFigmaList = FIGMA_APPEARANCE_ORDER.join(', ');
  const appearanceCodeRoles = ['auto', ...COMPONENT_APPEARANCE_ROLES].join(', ');

  return (
    <div className={styles.page} data-testid="slider-api-validation-root">
      <h2 className={styles.title}>Slider — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source of truth for types: <code>SliderProps</code> in{' '}
        <code>packages/ui/src/components/Slider/Slider.shared.ts</code>. Interactive matrices live under{' '}
        <strong>Test Scenarios</strong>; visual <strong>type × knobStyle</strong> grid below.
      </p>

      <h3 className={styles.sectionTitle}>Main API (Figma + code)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="slider-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Code (`SliderProps`)</th>
              <th scope="col">Match</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>type</strong>
              </td>
              <td>continuous, range</td>
              <td>
                No <code>type</code> prop — <code>number</code> vs <code>number[]</code> on <code>value</code> /{' '}
                <code>defaultValue</code>; <code>data-range</code> when array.
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <div style={{ width: TRACK_WIDTH }}>
                  <Slider defaultValue={[30, 70]} aria-label="API validation range type" />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>knobStyle</strong>
              </td>
              <td>inside, outside (Figma default: inside)</td>
              <td>
                <code>knobStyle?: &apos;inside&apos; | &apos;outside&apos;</code> — code default{' '}
                <code>&apos;outside&apos;</code>; pass <code>inside</code> for Figma parity
              </td>
              <td className={styles.matchWarn}>✓ ⚠️</td>
              <td className={styles.cellDemo}>
                <div style={{ width: TRACK_WIDTH }}>
                  <Slider
                    defaultValue={55}
                    knobStyle="inside"
                    appearance="secondary"
                    aria-label="API validation Figma default knob inside"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>appearance</strong>
              </td>
              <td>{appearanceFigmaList}</td>
              <td>
                <code>appearance?: SliderAppearance</code> — {SHARED_TYPES_NOTE} Concrete roles:{' '}
                <code>{appearanceCodeRoles}</code>
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <div style={{ width: TRACK_WIDTH }}>
                  <Slider
                    appearance="positive"
                    defaultValue={40}
                    aria-label="API validation appearance positive"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>steps</strong>
              </td>
              <td>true, false</td>
              <td>
                <code>showSteps?: boolean</code> (default <code>false</code>)
              </td>
              <td className={styles.matchWarn}>✓ ⚠️ rename</td>
              <td className={styles.cellDemo}>
                <div style={{ width: TRACK_WIDTH }}>
                  <Slider
                    defaultValue={50}
                    min={0}
                    max={100}
                    step={25}
                    showSteps
                    aria-label="API validation showSteps"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>stepCount</strong>
              </td>
              <td>number</td>
              <td>
                No <code>stepCount</code> — use <code>min</code>, <code>max</code>, <code>step</code>; tick count ={' '}
                <code>(max − min) / step + 1</code>
              </td>
              <td className={styles.matchWarn}>✓ ⚠️ derived</td>
              <td className={styles.cellDemo}>
                <div style={{ width: TRACK_WIDTH }}>
                  <Slider
                    defaultValue={50}
                    min={0}
                    max={100}
                    step={10}
                    showSteps
                    aria-label="API validation stepCount via step=10"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>start</strong>
              </td>
              <td>none, Icon, IconButton</td>
              <td>
                <code>start?: ReactNode</code> — 30×30 slot; omit for <code>none</code>
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <div style={{ width: TRACK_WIDTH }}>
                  <Slider
                    defaultValue={40}
                    aria-label="API validation start IconButton"
                    start={
                      <IconButton icon="remove" size="xs" attention="low" aria-label="Decrease" />
                    }
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>end</strong>
              </td>
              <td>none, Icon, IconButton</td>
              <td>
                <code>end?: ReactNode</code>
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <div style={{ width: TRACK_WIDTH }}>
                  <Slider
                    defaultValue={60}
                    aria-label="API validation end Icon"
                    end={<Icon name="add" size="5" aria-hidden />}
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Code only (Figma)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="slider-api-table-code-only">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Figma</th>
              <th scope="col">Code</th>
              <th scope="col">Match</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>value</strong>
              </td>
              <td>
                <code>number</code> or <code>[number, number]</code>
              </td>
              <td>
                <code>value?</code> / <code>defaultValue?</code> + <code>onValueChange?</code>
              </td>
              <td className={styles.matchOk}>✓</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on attached Figma API table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="slider-api-table-extra">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Code</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>orientation</strong>
              </td>
              <td>
                <code>orientation?: &apos;horizontal&apos; | &apos;vertical&apos;</code>
              </td>
              <td className={styles.matchWarn}>Vertical track in Test Scenarios. ⚠️</td>
            </tr>
            <tr>
              <td>
                <strong>showTooltip</strong>, <strong>snapToSteps</strong>, <strong>readOnly</strong>, <strong>disabled</strong>
              </td>
              <td>See `Slider.shared.ts`</td>
              <td className={styles.matchWarn}>Covered in Test Scenarios bands. ⚠️</td>
            </tr>
            <tr>
              <td>
                <strong>min</strong>, <strong>max</strong>, <strong>step</strong>, <strong>onValueCommitted</strong>…
              </td>
              <td>Base UI Slider contract</td>
              <td>Standard range input props — not on the Figma property sheet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
