'use client';

import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import { Icon } from '@oneui/ui/components/Icon';
import styles from '../shared/qa-api-validation.module.css';

export function SelectableButtonApiValidationShowcase() {
  return (
    <div className={styles.page} data-testid="selectable-button-api-validation-root">
      <h2 className={styles.title}>SelectableButton — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source: <code>packages/ui/src/components/SelectableButton/SelectableButton.shared.ts</code>.
      </p>

      <h3 className={styles.sectionTitle}>Main API — naming alignment</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="selectable-button-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Code</th>
              <th scope="col">Match</th>
              <th scope="col">Action item</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>size</strong></td>
              <td>S, M, L</td>
              <td><code>size?: &apos;xs&apos;|&apos;s&apos;|&apos;m&apos;|&apos;l&apos;</code> (default m)</td>
              <td className={styles.matchWarn}>⚠️</td>
              <td className={styles.actionItem}>Code adds XS; align Figma table or document XS as code-only.</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-size">
                  <SelectableButton size="m">Button</SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>elevation</strong></td>
              <td>high, medium, low</td>
              <td><code>attention?: &apos;high&apos;|&apos;medium&apos;|&apos;low&apos;</code></td>
              <td className={styles.matchWarn}>⚠️ Rename</td>
              <td className={styles.actionItem}>Figma <code>elevation</code> = code <code>attention</code> (selected-state prominence).</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-attention">
                  <SelectableButton attention="medium" selected>
                    Button
                  </SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>colorScheme</strong></td>
              <td>active, neutral, primary, secondary, success, warning, error, surface, onSurface, onSurfaceVariant</td>
              <td>
                <code>appearance?: ComponentAppearance</code> (9 roles + auto — different vocabulary)
              </td>
              <td className={styles.matchFail}>✗</td>
              <td className={styles.actionItem}>Publish mapping table Figma colorScheme → appearance; values do not 1:1 match.</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-appearance">
                  <SelectableButton appearance="positive" selected>
                    Button
                  </SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>isSelected</strong></td>
              <td>true, false</td>
              <td><code>selected?</code> / <code>defaultSelected?</code></td>
              <td className={styles.matchWarn}>⚠️ Rename</td>
              <td className={styles.actionItem}>Document boolean naming; toggle uses Base UI Toggle pressed state.</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-selected">
                  <SelectableButton selected>Button</SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>isCondensed</strong></td>
              <td>true, false</td>
              <td><code>condensed?: boolean</code> (only when contained)</td>
              <td className={styles.matchWarn}>⚠️ Rename</td>
              <td className={styles.actionItem}>Figma rule: condensed only when contained — matches code guard.</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-condensed">
                  <SelectableButton condensed contained>
                    Button
                  </SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>isContained</strong></td>
              <td>true, false</td>
              <td><code>contained?: boolean</code> (default true)</td>
              <td className={styles.matchWarn}>⚠️ Rename</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-contained">
                  <SelectableButton contained={false}>Button</SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>startIcon / endIcon</strong></td>
              <td>icon name, none</td>
              <td><code>start?</code> <code>end?</code> ReactNode slots</td>
              <td className={styles.matchWarn}>⚠️</td>
              <td className={styles.actionItem}>Slots accept Icon nodes, not string icon names.</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-icons">
                  <SelectableButton start={<Icon icon="check" size="4" />} selected>
                    Button
                  </SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>fullWidth</strong></td>
              <td>true, false</td>
              <td><code>fullWidth?: boolean</code></td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>disabled</strong></td>
              <td>true, false</td>
              <td><code>disabled?</code></td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-disabled">
                  <SelectableButton disabled>
                    Button
                  </SelectableButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>loading</strong></td>
              <td>true, false</td>
              <td><code>loading?</code> — hides slot icons per Figma note</td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="selectable-button-api-demo-loading">
                  <SelectableButton loading>
                    Button
                  </SelectableButton>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Figma style-only / code-only</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="selectable-button-api-table-style">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Figma</th>
              <th scope="col">Code</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>bgColor</strong></td>
              <td>primary, secondary, …</td>
              <td>Driven by <code>appearance</code> + attention</td>
              <td>No separate bgColor prop.</td>
            </tr>
            <tr>
              <td><strong>content</strong></td>
              <td>text, icon</td>
              <td><code>children</code> + optional icon slots</td>
              <td>Icon-only mode: children omitted + start/end icons.</td>
            </tr>
            <tr>
              <td><strong>onSelectedChange</strong></td>
              <td>N/A</td>
              <td>Controlled selection callback</td>
              <td>Required for toggle groups.</td>
            </tr>
            <tr>
              <td><strong>value</strong></td>
              <td>N/A</td>
              <td>ToggleGroup integration</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
