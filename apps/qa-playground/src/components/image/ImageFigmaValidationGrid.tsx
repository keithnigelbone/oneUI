'use client';

import { Image } from '@oneui/ui/components/Image';
import type { ImageAspectRatio } from '@oneui/ui/components/Image';
import styles from '../shared/qa-figma-validation.module.css';

const SAMPLE_SRC =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&h=400&fit=crop';

/** Figma aspect ratios from attached spec (none → auto in code). */
const FIGMA_ASPECT_ROWS: readonly { aspect: ImageAspectRatio; figmaLabel: string }[] = [
  { aspect: 'auto', figmaLabel: 'none' },
  { aspect: '1:1', figmaLabel: '1:1' },
  { aspect: '3:2', figmaLabel: '3:2' },
  { aspect: '4:3', figmaLabel: '4:3' },
  { aspect: '16:9', figmaLabel: '16:9' },
  { aspect: '2:3', figmaLabel: '2:3' },
  { aspect: '3:4', figmaLabel: '3:4' },
  { aspect: '9:16', figmaLabel: '9:16' },
];

const FIT_COLS = ['cover', 'contain'] as const;

export function ImageFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Grid mirrors Figma aspect-ratio samples. Each cell: fixed width, <code>fit</code> column, shared photo{' '}
        <code>src</code>.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-image-aspect-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Image — aspect (Figma) × fit
          </caption>
          <tbody>
            {FIGMA_ASPECT_ROWS.map(({ aspect, figmaLabel }) => (
              <tr key={aspect} data-testrow={`aspect-${aspect}`}>
                {FIT_COLS.map((fit) => (
                  <td key={fit} className={styles.cell}>
                    <Image
                      src={SAMPLE_SRC}
                      alt={`Aspect ${figmaLabel} ${fit}`}
                      aspectRatio={aspect}
                      fit={fit}
                      width={140}
                      testID={`image-figma-val-${aspect.replace(':', '-')}-${fit}`}
                    />
                  </td>
                ))}
                <th scope="row" className={styles.rowLabelRight}>
                  aspect: {figmaLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {FIT_COLS.map((fit) => (
                <td key={fit} className={styles.footerLabel}>
                  fit: {fit}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
