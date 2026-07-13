'use client';

import { Image } from '@oneui/ui/components/Image';
import styles from '../shared/qa-api-validation.module.css';

const SAMPLE_SRC =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop';

const FIGMA_ASPECT =
  'none, 1:1, 3:2, 4:3, 16:9, 2:3, 3:4, 9:16, 3:1, 1:3';

export function ImageApiValidationShowcase() {
  return (
    <div className={styles.page} data-testid="image-api-validation-root">
      <h2 className={styles.title}>Image — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source: <code>packages/ui/src/components/Image/Image.shared.ts</code>.
      </p>

      <h3 className={styles.sectionTitle}>Main API</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="image-api-table-main">
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
              <td><strong>aspect</strong></td>
              <td>{FIGMA_ASPECT}</td>
              <td>
                <code>aspectRatio?: ImageAspectRatio</code> — <code>none</code> → <code>auto</code>; extra{' '}
                <code>1:2, 2:1, 9:21, 21:9</code> in code
              </td>
              <td className={styles.matchWarn}>⚠️ Partial</td>
              <td className={styles.actionItem}>Align naming <code>aspect</code> vs <code>aspectRatio</code>; document extra ratios.</td>
              <td className={styles.cellDemo}>
                <Image src={SAMPLE_SRC} alt="Demo" aspectRatio="16:9" width={120} testID="image-api-demo-aspect" />
              </td>
            </tr>
            <tr>
              <td><strong>border</strong></td>
              <td>true, false</td>
              <td>Not a prop — use brand token <code>--Image-border</code> / CSS module</td>
              <td className={styles.matchFail}>✗ Missing</td>
              <td className={styles.actionItem}>Add <code>border?: boolean</code> or remove from Figma API table.</td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>fit</strong></td>
              <td>cover, contain, fill, none, scale-down</td>
              <td>
                <code>fit?</code> or <code>objectFit?</code> (default <code>cover</code>)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <Image src={SAMPLE_SRC} alt="Contain" fit="contain" aspectRatio="1:1" width={80} testID="image-api-demo-fit" />
              </td>
            </tr>
            <tr>
              <td><strong>radius</strong></td>
              <td>none, small, medium, large, full</td>
              <td>
                Not a prop — <code>--Image-borderRadius</code> / Shape tokens via <code>style</code>
              </td>
              <td className={styles.matchFail}>✗ Missing</td>
              <td className={styles.actionItem}>Add <code>radius</code> enum prop or map Figma presets in docs.</td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>alt</strong></td>
              <td>text</td>
              <td><code>alt: string</code> (required)</td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <Image src={SAMPLE_SRC} alt="Taj Mahal" width={80} testID="image-api-demo-alt" />
              </td>
            </tr>
            <tr>
              <td><strong>src</strong></td>
              <td>URL</td>
              <td><code>src: string</code> (required)</td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>loading</strong></td>
              <td>eager, lazy</td>
              <td>
                <code>loading?: &apos;auto&apos; | &apos;lazy&apos; | &apos;eager&apos;</code> (default <code>lazy</code>)
              </td>
              <td className={styles.matchWarn}>⚠️</td>
              <td className={styles.actionItem}>Code adds <code>auto</code> (omit HTML attribute).</td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>fallback</strong></td>
              <td>URL</td>
              <td>
                <code>fallbackSrc?</code> + <code>fallback?: ReactNode</code>
              </td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <Image
                  src="https://invalid.example/broken.jpg"
                  alt="Broken"
                  aspectRatio="1:1"
                  width={80}
                  testID="image-api-demo-fallback"
                />
              </td>
            </tr>
            <tr>
              <td><strong>overlay</strong></td>
              <td>true, false</td>
              <td>Not implemented</td>
              <td className={styles.matchFail}>✗ Missing</td>
              <td className={styles.actionItem}>Add overlay prop or document as composition pattern.</td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>caption</strong></td>
              <td>text</td>
              <td>Not implemented — compose with typography outside Image</td>
              <td className={styles.matchFail}>✗ Missing</td>
              <td className={styles.actionItem}>Add optional <code>caption</code> slot or keep out of component API.</td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>width / height</strong></td>
              <td>number</td>
              <td><code>width?</code> <code>height?</code> string | number</td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <Image src={SAMPLE_SRC} alt="Sized" width={100} height={60} testID="image-api-demo-dimensions" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on Figma API table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="image-api-table-extra">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Code</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>interactive</strong></td>
              <td><code>interactive?: boolean</code> — renders as button with focus ring</td>
              <td>Figma may model tap target separately.</td>
            </tr>
            <tr>
              <td><strong>disabled</strong></td>
              <td>Reduces opacity; blocks interaction when interactive</td>
              <td>—</td>
            </tr>
            <tr>
              <td><strong>testID</strong></td>
              <td>Maps to <code>data-testid</code> on web root</td>
              <td>Automation only.</td>
            </tr>
            <tr>
              <td><strong>srcSet / sizes / crossOrigin / decoding / draggable</strong></td>
              <td>Web HTML passthrough</td>
              <td>Document in web integration guide.</td>
            </tr>
            <tr>
              <td><strong>lottieAttributes</strong></td>
              <td><code>data-oneui-lottie</code> JSON on root</td>
              <td>Host bridge — not in Figma table.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
