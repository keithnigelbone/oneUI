'use client';

import { TouchSlider } from '@oneui/ui/components/TouchSlider';
import type { TouchSliderAppearance, TouchSliderProgressStyle } from '@oneui/ui/components/TouchSlider';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { TouchSliderVolumeIcon } from './TouchSliderVolumeIcon';
import styles from './TouchSliderApiValidationShowcase.module.css';

/** Figma TouchSlider API table order (+ `auto`). */
const FIGMA_APPEARANCE_ORDER: readonly TouchSliderAppearance[] = [
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

const FIGMA_TRACK_WIDTH = 138;

const SHARED_TYPES_NOTE =
  '`TouchSliderAppearance` is `ComponentAppearance` from `@oneui/shared` (includes `brand-bg` not on the attached Figma API screenshot).';

type MatchKind = 'ok' | 'warn' | 'missing' | 'na';

function matchCell(kind: MatchKind, label?: string) {
  const className =
    kind === 'ok'
      ? styles.matchOk
      : kind === 'warn'
        ? styles.matchWarn
        : kind === 'missing'
          ? styles.matchMissing
          : styles.matchNa;
  const symbol =
    kind === 'ok' ? '✓' : kind === 'warn' ? '✓ ⚠️' : kind === 'missing' ? '✗' : '—';
  return (
    <td className={className}>
      {label ?? symbol}
    </td>
  );
}

/**
 * Figma **TouchSlider** API table ↔ shipped `TouchSlider` / `TouchSliderProps`.
 * Includes a reference section for attached `.Knob` / `.Steps` / `.ActiveTrack` sub-specs
 * (implemented on **Slider**, not public TouchSlider API).
 */
export function TouchSliderApiValidationShowcase() {
  const appearanceFigmaList = FIGMA_APPEARANCE_ORDER.join(', ');
  const appearanceCodeRoles = ['auto', ...COMPONENT_APPEARANCE_ROLES].join(', ');

  return (
    <div className={styles.page} data-testid="touch-slider-api-validation-root">
      <h2 className={styles.title}>Touch Slider — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source of truth for <strong>props/API</strong>: <code>TouchSliderProps</code> in{' '}
        <code>packages/ui/src/components/TouchSlider/TouchSlider.shared.ts</code>. This page documents API match
        and <strong>visual parity gaps vs Figma</strong> (QA only — no component edits from this playground).
        Parity automation: <code>e2e/touch-slider-figma-parity.spec.ts</code>.
      </p>

      <h3 className={styles.sectionTitle}>TouchSlider — main API (attached Figma sheet)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="touch-slider-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Code (`TouchSliderProps`)</th>
              <th scope="col">Match</th>
              <th scope="col">Action / note</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>orientation</strong>
              </td>
              <td>horizontal, vertical</td>
              <td>
                <code>orientation?: &apos;horizontal&apos; | &apos;vertical&apos;</code> — default{' '}
                <code>horizontal</code>
              </td>
              {matchCell('warn', '✓ ⚠️ visual')}
              <td className={styles.actionCell}>
                Prop aligned. Figma vertical bar often missing in render — tracked in parity tests (QA).
              </td>
              <td className={styles.cellDemo}>
                <div style={{ minHeight: 'var(--Dimension-f14)' }}>
                  <TouchSlider
                    defaultValue={60}
                    orientation="vertical"
                    progressStyle="rounded"
                    aria-label="API validation vertical"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>progressStyle</strong>
              </td>
              <td>
                sharp, rounded (labels: <code>straight</code>). <strong>Rounded art:</strong> moving knob + icon
                on knob. <strong>Straight art:</strong> square outer track, static icon.
              </td>
              <td>
                <code>progressStyle?: &apos;rounded&apos; | &apos;sharp&apos;</code> — default{' '}
                <code>rounded</code>. Shipped: pill outer track always; only <strong>trailing fill edge</strong>{' '}
                flips; icon fixed in <code>start</code> slot for both.
              </td>
              {matchCell('warn', '✓ ⚠️ visual')}
              <td className={styles.actionCell}>
                API name: map Figma <code>straight</code> → <code>sharp</code>. Visual: see parity table below
                (design decision — not a QA fix in <code>packages/ui</code>).
              </td>
              <td className={styles.cellDemo}>
                <div style={{ width: FIGMA_TRACK_WIDTH }}>
                  <TouchSlider
                    defaultValue={50}
                    progressStyle="sharp"
                    aria-label="API validation sharp progress"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>value</strong>
              </td>
              <td>0, 50, 100 (examples); any step 0–100 per dev note</td>
              <td>
                <code>value?</code> / <code>defaultValue?</code> — <code>number</code> only at runtime
                (single thumb). <code>min</code>/<code>max</code>/<code>step</code> control range.
              </td>
              {matchCell('ok')}
              <td className={styles.actionCell}>
                Figma shows discrete demos; code supports continuous values (e.g. 37).
              </td>
              <td className={styles.cellDemo}>
                <div style={{ width: FIGMA_TRACK_WIDTH }}>
                  <TouchSlider defaultValue={0} aria-label="API validation value 0" />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>appearance</strong>
              </td>
              <td>{appearanceFigmaList}</td>
              <td>
                <code>appearance?: TouchSliderAppearance</code> — {SHARED_TYPES_NOTE} Roles:{' '}
                <code>{appearanceCodeRoles}</code>. <code>auto</code> → <code>secondary</code>.
              </td>
              {matchCell('ok')}
              <td className={styles.actionCell}>
                Code adds <code>brand-bg</code> ⚠️ not on Figma sheet.
              </td>
              <td className={styles.cellDemo}>
                <div style={{ width: FIGMA_TRACK_WIDTH }}>
                  <TouchSlider
                    appearance="primary"
                    defaultValue={50}
                    start={<TouchSliderVolumeIcon />}
                    aria-label="API validation appearance primary"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>start</strong> (slot)
              </td>
              <td>Icon in Figma art (e.g. speaker)</td>
              <td>
                <code>start?: ReactNode</code> — 30×30 slot; icon anchored at track start. Slot wrapper is{' '}
                <code>aria-hidden</code>; slider keeps <code>aria-label</code>.
              </td>
              {matchCell('ok')}
              <td className={styles.actionCell}>
                Icon must use <code>aria-hidden</code> or name on slider — not both unnamed.
              </td>
              <td className={styles.cellDemo}>
                <div style={{ width: FIGMA_TRACK_WIDTH }}>
                  <TouchSlider
                    defaultValue={50}
                    start={<TouchSliderVolumeIcon />}
                    aria-label="Volume touch slider"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <strong>rounded — moving knob</strong>
              </td>
              <td>Circular orange knob at fill edge; icon inside knob</td>
              <td>
                No visible knob — hidden thumb; <code>start</code> icon does not move with value
              </td>
              {matchCell('missing', '✗ visual')}
              <td className={styles.actionCell}>
                Known Figma vs shipped gap — tracked in <code>touch-slider-figma-parity.spec.ts</code>.
              </td>
              <td className={styles.matchNa}>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on attached TouchSlider Figma table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="touch-slider-api-table-extra">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Code</th>
              <th scope="col">Default</th>
              <th scope="col">Match</th>
              <th scope="col">Action / note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>disabled</strong>, <strong>readOnly</strong>
              </td>
              <td>
                <code>disabled?</code>, <code>readOnly?</code>
              </td>
              <td>
                <code>false</code>
              </td>
              {matchCell('warn')}
              <td className={styles.actionCell}>Test Scenarios band 7 — not on Figma property sheet.</td>
            </tr>
            <tr>
              <td>
                <strong>min</strong>, <strong>max</strong>, <strong>step</strong>, <strong>largeStep</strong>
              </td>
              <td>Base UI range contract</td>
              <td>
                0 / 100 / 1 / 10
              </td>
              {matchCell('warn')}
              <td className={styles.actionCell}>Standard range input — document in Figma dev notes.</td>
            </tr>
            <tr>
              <td>
                <strong>onValueChange</strong>, <strong>onValueCommitted</strong>
              </td>
              <td>Change handlers</td>
              <td>—</td>
              {matchCell('warn')}
              <td className={styles.actionCell}>Required for controlled volume UX.</td>
            </tr>
            <tr>
              <td>
                <strong>number[]</strong> on <code>value</code>
              </td>
              <td>Types allow array; UI renders one thumb only</td>
              <td>—</td>
              {matchCell('missing', '✗')}
              <td className={styles.actionCell}>
                Type-level gap — document in design system; parity tests use single <code>number</code> only.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Visual parity vs Figma art (QA — component unchanged)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="touch-slider-api-table-visual-parity">
          <thead>
            <tr>
              <th scope="col">Figma visual</th>
              <th scope="col">As-shipped render</th>
              <th scope="col">Parity</th>
              <th scope="col">QA action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>rounded</strong> — knob moves; icon on knob
              </td>
              <td>Fill grows; icon static in <code>start</code> slot</td>
              {matchCell('missing', '✗')}
              <td className={styles.actionCell}>Assert in parity spec; design sign-off if fill-only is final.</td>
            </tr>
            <tr>
              <td>
                <strong>straight</strong> — square outer track
              </td>
              <td>Pill outer track; sharp = flat trailing fill edge only</td>
              {matchCell('missing', '✗')}
              <td className={styles.actionCell}>Parity test checks <code>data-progress-style=&quot;sharp&quot;</code>.</td>
            </tr>
            <tr>
              <td>
                <strong>straight</strong> — icon gray at value 0
              </td>
              <td>Icon uses role on-color token at all values</td>
              {matchCell('warn', '⚠️')}
              <td className={styles.actionCell}>Optional future design token split — not asserted as pass/fail.</td>
            </tr>
            <tr>
              <td>
                <strong>vertical</strong> — visible 32×138 bar
              </td>
              <td>Often icon-only in matrix; slider API still works</td>
              {matchCell('missing', '✗')}
              <td className={styles.actionCell}>
                Parity tests: <code>aria-valuenow</code> + <code>data-progress-style</code>; not pixel diff.
              </td>
            </tr>
            <tr>
              <td>
                <strong>horizontal</strong> — value 0 / 50 / 100 fill
              </td>
              <td>Peach rail + orange fill — broadly matches</td>
              {matchCell('ok')}
              <td className={styles.actionCell}>Covered by Figma Validation grid + functional e2e.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>
        Attached sub-components (.Knob · .Steps · .ActiveTrack) — Slider internals, not TouchSlider props
      </h3>
      <p className={styles.metaLine}>
        Image 2 documents Figma sub-layers used by the precision <strong>Slider</strong> component (
        <code>packages/ui/src/components/_sliderInternals/</code>). TouchSlider does not expose these as
        public props.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="touch-slider-api-table-internals">
          <thead>
            <tr>
              <th scope="col">Figma node</th>
              <th scope="col">Figma property</th>
              <th scope="col">Figma values</th>
              <th scope="col">Code mapping (Slider)</th>
              <th scope="col">TouchSlider</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>.Knob</td>
              <td>size</td>
              <td>extra-small, small, medium, large</td>
              <td>
                Not a prop — fixed geometry via <code>knobStyle</code> inside/outside + CSS tokens (
                <code>SliderKnob.module.css</code>)
              </td>
              {matchCell('na', 'N/A')}
              <td className={styles.actionCell}>Use <code>Slider</code> for visible knobs.</td>
            </tr>
            <tr>
              <td>.Knob</td>
              <td>state</td>
              <td>idle, hover, pressed, focused</td>
              <td>
                CSS <code>:hover</code>, <code>[data-dragging]</code>, <code>:focus-visible</code>; Storybook{' '}
                <code>data-force-state</code>
              </td>
              {matchCell('na', 'N/A')}
              <td className={styles.actionCell}>TouchSlider focus via track/thumb halo in CSS.</td>
            </tr>
            <tr>
              <td>.Knob</td>
              <td>appearance</td>
              <td>blue, success, error, … (legacy color-mode)</td>
              <td>
                <code>appearance</code> → <code>ComponentAppearance</code> (primary, positive, …)
              </td>
              {matchCell('na', 'N/A')}
              <td className={styles.actionCell}>Align Figma color-mode names with unified roles.</td>
            </tr>
            <tr>
              <td>.Steps</td>
              <td>height</td>
              <td>number</td>
              <td>
                No <code>height</code> prop — ticks from <code>min</code>/<code>max</code>/<code>step</code> +{' '}
                <code>showSteps</code>
              </td>
              {matchCell('na', 'N/A')}
              <td className={styles.actionCell}>TouchSlider has no step ticks.</td>
            </tr>
            <tr>
              <td>.ActiveTrack</td>
              <td>type</td>
              <td>continuous, step</td>
              <td>
                <code>number</code> vs <code>number[]</code> + <code>showSteps</code> on <code>Slider</code>
              </td>
              {matchCell('na', 'N/A')}
              <td className={styles.actionCell}>—</td>
            </tr>
            <tr>
              <td>.ActiveTrack</td>
              <td>thickness</td>
              <td>small, medium</td>
              <td>Single Figma size — token <code>--TouchSlider-thickness</code> / recipe, not a prop</td>
              {matchCell('warn', '⚠️')}
              <td className={styles.actionCell}>Expose thickness enum only if multi-size returns.</td>
            </tr>
            <tr>
              <td>.ActiveTrack</td>
              <td>terminator</td>
              <td>rounded, sharp</td>
              <td>
                TouchSlider: <code>progressStyle</code>. Slider track: pill rail + knob caps.
              </td>
              {matchCell('ok', '✓')}
              <td className={styles.actionCell}>
                <code>terminator</code> renamed to <code>progressStyle</code> on TouchSlider.
              </td>
            </tr>
            <tr>
              <td>.ActiveTrack</td>
              <td>start</td>
              <td>true, false</td>
              <td>
                TouchSlider: <code>start</code> slot (ReactNode), not boolean
              </td>
              {matchCell('warn', '✓ ⚠️')}
              <td className={styles.actionCell}>Figma boolean → code slot pattern.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Behaviour &amp; default summary</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="touch-slider-api-table-behaviour">
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Figma / design intent</th>
              <th scope="col">Implementation</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Default appearance</td>
              <td>Variable mode (often primary/secondary in art)</td>
              <td>
                <code>auto</code> → <code>secondary</code> (<code>data-appearance=&quot;secondary&quot;</code>)
              </td>
              {matchCell('warn')}
            </tr>
            <tr>
              <td>Icon anchor (straight)</td>
              <td>Icon fixed at start for all values</td>
              <td>
                <code>start</code> slot fixed at track start — matches straight Figma
              </td>
              {matchCell('ok')}
            </tr>
            <tr>
              <td>Icon anchor (rounded)</td>
              <td>Icon moves with circular knob</td>
              <td>Icon fixed in <code>start</code> slot — does not move</td>
              {matchCell('missing', '✗')}
            </tr>
            <tr>
              <td>progressStyle rounded visual</td>
              <td>Moving knob + icon on knob</td>
              <td>Fill-only; trailing edge pill cap</td>
              {matchCell('missing', '✗')}
            </tr>
            <tr>
              <td>progressStyle straight visual</td>
              <td>Square outer track</td>
              <td>Pill outer + sharp trailing fill</td>
              {matchCell('missing', '✗')}
            </tr>
            <tr>
              <td>Vertical track visible</td>
              <td>Full vertical bar in art</td>
              <td>Known render gap — API/orientation props still work</td>
              {matchCell('missing', '✗')}
            </tr>
            <tr>
              <td>Keyboard</td>
              <td>Arrow keys adjust value</td>
              <td>Base UI Slider — role <code>slider</code>, native range input semantics</td>
              {matchCell('ok')}
            </tr>
            <tr>
              <td>Range slider</td>
              <td>Not in TouchSlider art</td>
              <td>Not implemented (single thumb)</td>
              {matchCell('ok')}
            </tr>
            <tr>
              <td>Knob spacing breakpoints</td>
              <td>Desktop 16px, laptop/tablet 12px, mobile 8px</td>
              <td>Applies to <code>Slider</code> knob spacing — N/A for TouchSlider</td>
              {matchCell('na')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
