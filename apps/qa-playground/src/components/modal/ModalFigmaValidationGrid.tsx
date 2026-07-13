'use client';

import clsx from 'clsx';
import styles from './modal-figma-validation.module.css';

// ─── Body text ────────────────────────────────────────────────────────────────
// Real copy so the text wraps differently per modal width:
//   Narrow FullWidth (360 dp ~312 px inner) → ~3 lines → taller card
//   Wide FullWidth  (1920 dp)               → 1 line  → compact landscape
const BODY_TEXT =
  'This is the modal body content. You can place any layout or elements here as needed.';

// ─── Modal preview card ────────────────────────────────────────────────────────

interface ModalPreviewProps {
  size: 'S' | 'M' | 'L' | 'FullWidth';
  /** CSS Module class that sets the card's width (sizeS / sizeM / sizeL / sizeFullWidth) */
  sizeClassName?: string;
  'data-testid'?: string;
}

function ModalPreview({ size, sizeClassName, 'data-testid': testId }: ModalPreviewProps) {
  return (
    <div
      className={clsx(styles.previewCard, sizeClassName)}
      data-testid={testId}
      role="dialog"
      aria-label="Title"
    >
      <div className={styles.previewHeader}>
        <div className={styles.previewTitle}>Title</div>
        <div className={styles.previewCloseBtn} aria-hidden="true">✕</div>
      </div>
      <div className={styles.previewDivider} />
      <div className={styles.previewBody}>{BODY_TEXT}</div>
      <div className={styles.previewDivider} />
      <div className={styles.previewFooter}>
        <button type="button" className={styles.previewBtnLow} tabIndex={-1} aria-hidden="true">
          Cancel
        </button>
        <button type="button" className={styles.previewBtnHigh} tabIndex={-1} aria-hidden="true">
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const PLATFORM_ROWS = [
  { platform: 360,  testRowId: '360'  },
  { platform: 768,  testRowId: '768'  },
  { platform: 1024, testRowId: '1024' },
  { platform: 1448, testRowId: '1448' },
  { platform: 1920, testRowId: '1920' },
] as const;

type ModalSize = 'S' | 'M' | 'L' | 'FullWidth';

const SIZE_COLUMNS: { size: ModalSize; label: string }[] = [
  { size: 'S',         label: 'Small'     },
  { size: 'M',         label: 'Medium'    },
  { size: 'L',         label: 'Large'     },
  { size: 'FullWidth', label: 'FullWidth' },
];

const ANNOTATIONS: Record<ModalSize, { text: string; bold: boolean }[]> = {
  S:         [{ text: 'size: S',         bold: true  }, { text: 'header: true',   bold: false }, { text: 'footer: true',   bold: false }, { text: 'dividers: false', bold: false }],
  M:         [{ text: 'size: M',         bold: true  }, { text: 'header: true',   bold: false }, { text: 'footer: true',   bold: false }, { text: 'dividers: false', bold: false }],
  L:         [{ text: 'size: L',         bold: true  }, { text: 'header: true',   bold: false }, { text: 'footer: true',   bold: false }, { text: 'dividers: false', bold: false }],
  FullWidth: [{ text: 'size: FullWidth', bold: true  }, { text: 'header: true',   bold: false }, { text: 'footer: true',   bold: false }, { text: 'dividers: false', bold: false }],
};

// ─── Size class for the CARD ─────────────────────────────────────────────────
// Applied to .previewCard so the CSS min() can compare natural width vs 100%
// of the column (which has maxWidth: platform for S/M/L, width: platform for FW).
function cardSizeClass(size: ModalSize) {
  return size === 'S' ? styles.sizeS
    : size === 'M' ? styles.sizeM
    : size === 'L' ? styles.sizeL
    : styles.sizeFullWidth; // fills the platform-width column
}

// ─── Viewport frame component ─────────────────────────────────────────────────

interface ViewportCardProps {
  platform: number;
  testRowId: string;
}

function ViewportCard({ platform, testRowId }: ViewportCardProps) {
  return (
    <div className={styles.viewportCard} data-testrow={testRowId}>

      {/* ── Browser-chrome header ─────────────────────────── */}
      <div className={styles.frameHeader}>
        {/* Traffic-light dots */}
        <div className={styles.frameDots}>
          <span className={styles.frameDot} />
          <span className={styles.frameDot} />
          <span className={styles.frameDot} />
        </div>

        {/* Address-bar area with platform label */}
        <div className={styles.frameAddressBar}>
          <span className={styles.framePlatformKey}>platform:</span>
          <span className={styles.framePlatformValue}>{platform}</span>
          <span className={styles.frameDividerDot}>·</span>
          <span className={styles.framePlatformKey}>4 variations</span>
        </div>

        {/* Width badge */}
        <div className={styles.frameWidthBadge}>
          <span className={styles.frameWidthBadgeIcon}>↔</span>
          <span className={styles.frameWidthBadgeText}>{platform} dp</span>
        </div>
      </div>

      {/* ── Scrollable viewport body ──────────────────────── */}
      {/*
        Each modal lives in its own .modalColumn.
        S / M / L columns use a CSS size class to set their width.
        FullWidth column gets style.width = platform dp so it grows
        between viewport cards (360 → 768 → … → 1920).
      */}
      <div
        className={styles.viewportBody}
        tabIndex={0}
        role="group"
        aria-label={`Modal size previews at ${platform}dp viewport`}
      >
        {SIZE_COLUMNS.map(({ size }) => {
          const isFW = size === 'FullWidth';
          return (
            <div
              key={size}
              className={styles.modalColumn}
              // FullWidth: width = platform dp — the only column that changes per viewport.
              // S / M / L: no width set — the card's natural token size determines the column.
              style={isFW ? { width: platform } : undefined}
            >
              <ModalPreview
                size={size}
                sizeClassName={cardSizeClass(size)}
                data-testid={`modal-figma-val-${size.toLowerCase()}-${testRowId}`}
              />

              <div className={styles.annotations}>
                {ANNOTATIONS[size].map(({ text, bold }) => (
                  <span
                    key={text}
                    className={clsx(styles.annotationLine, bold && styles.annotationLineBold)}
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Modal Figma validation — one viewport window per platform breakpoint.
 *
 * Layout:
 *   • Five viewport cards stack vertically: 360 | 768 | 1024 | 1448 | 1920 dp.
 *   • Each card has a browser-chrome frame header showing the platform dp.
 *   • The card body is a horizontally-scrollable viewport area (--Surface-Default)
 *     with all four modal size variants (S, M, L, FullWidth) side by side.
 *   • S / M / L always render at their natural token widths across all viewports —
 *     so you can compare sizes without distortion.
 *   • FullWidth column grows with the platform (360 → 1920 dp), making the
 *     viewport-wise variation immediately visible: at 360 dp FullWidth is narrow;
 *     at 1920 dp it spans the full viewport while S/M/L stay compact.
 */
export function ModalFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        One viewport window per platform breakpoint. Each window's body scrolls horizontally to
        show all 4 size variants. FullWidth grows with the platform (360 → 1920 dp); S / M / L
        keep their fixed token widths across all viewports.
      </p>

      <p className={styles.figmaCaption}>
        <span className={styles.figmaCaptionMark} aria-hidden="true">❖ </span>
        Modal
      </p>

      <div className={styles.viewportStack} data-testid="figma-modal-grid">
        {PLATFORM_ROWS.map(({ platform, testRowId }) => (
          <ViewportCard key={testRowId} platform={platform} testRowId={testRowId} />
        ))}
      </div>
    </div>
  );
}
