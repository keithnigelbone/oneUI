'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { Image } from '@oneui/ui/components/Image';
import type { ImageAspectRatio, ImageObjectFit } from '@oneui/ui/components/Image';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so Image tokens remap against the same parent step as Bottom Navigation QA strips.
 */
function QaNeutralSurfaceFrame({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Surface
      mode="minimal"
      appearance="neutral"
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--Spacing-4-5)',
        padding: 'var(--Spacing-4-5)',
        borderRadius: 'var(--Shape-4-5)',
        ...style,
      }}
    >
      {children}
    </Surface>
  );
}

const SAMPLE_SRC =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop';

/** Custom fallback slot — override inherited --Text-Low from Image fallback chrome for WCAG AA. */
const FALLBACK_LABEL_STYLE: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-High)',
};

const FIGMA_ASPECTS: readonly { ratio: ImageAspectRatio; label: string }[] = [
  { ratio: 'auto', label: 'none (auto)' },
  { ratio: '1:1', label: '1:1' },
  { ratio: '3:2', label: '3:2' },
  { ratio: '4:3', label: '4:3' },
  { ratio: '16:9', label: '16:9' },
  { ratio: '2:3', label: '2:3' },
  { ratio: '3:4', label: '3:4' },
  { ratio: '9:16', label: '9:16' },
];

const FIT_MODES: readonly ImageObjectFit[] = ['cover', 'contain', 'fill', 'none', 'scale-down'];

export function ImageQaShowcase() {
  const [clicks, setClicks] = useState(0);

  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="image-qa-default" title="Default" centerContent>
        <QaNeutralSurfaceFrame>
          <Image src={SAMPLE_SRC} alt="Landscape" width={200} testID="image-default" />
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="image-qa-aspect" title="1 Aspect ratio (Figma aspect → aspectRatio)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {FIGMA_ASPECTS.map(({ ratio, label }) => (
              <div key={ratio} className={styles.scenarioLabeledCellWide}>
                <QaNeutralSurfaceFrame style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
                  <Image
                    src={SAMPLE_SRC}
                    alt={label}
                    aspectRatio={ratio}
                    width={160}
                    testID={`image-aspect-${ratio === 'auto' ? 'auto' : ratio.replace(':', '-')}`}
                  />
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{label}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="image-qa-fit" title="2 Fit / object-fit" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="Image fit modes">
          <div className={styles.scenarioFlexRow}>
            {FIT_MODES.map((fit) => (
              <div key={fit} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <Image
                    src={SAMPLE_SRC}
                    alt={fit}
                    fit={fit}
                    aspectRatio="1:1"
                    width={100}
                    testID={`image-fit-${fit}`}
                  />
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{fit}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="image-qa-interactive" title="3 Interactive · disabled" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaNeutralSurfaceFrame>
                <Image
                  src={SAMPLE_SRC}
                  alt="Open gallery"
                  interactive
                  aspectRatio="16:9"
                  width={180}
                  onClick={() => setClicks((c) => c + 1)}
                  testID="image-interactive"
                />
              </QaNeutralSurfaceFrame>
              <span className={styles.scenarioCellCaption} data-testid="image-click-count">
                clicks: {clicks}
              </span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="image-qa-fallback" title="4 Fallback · error" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <Image
              src="https://invalid.example/broken.jpg"
              alt="Broken with placeholder"
              aspectRatio="1:1"
              width={120}
              loading="eager"
              testID="image-fallback-default"
            />
            <Image
              src="https://invalid.example/broken.jpg"
              alt="Custom fallback node"
              aspectRatio="1:1"
              width={120}
              loading="eager"
              fallback={<span style={FALLBACK_LABEL_STYLE}>Custom fallback</span>}
              testID="image-fallback-node"
            />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="image-qa-loading" title="5 Loading strategy" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <Image src={SAMPLE_SRC} alt="Lazy" loading="lazy" width={100} testID="image-loading-lazy" />
            <Image src={SAMPLE_SRC} alt="Eager" loading="eager" width={100} testID="image-loading-eager" />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="image-qa-a11y" title="6 Accessibility — alt text" overflow>
        <p className={styles.storySectionLead}>
          Decorative images should use <code>alt=&quot;&quot;</code> when adjacent text conveys meaning (not shown here).
        </p>
        <QaNeutralSurfaceFrame>
          <Image src={SAMPLE_SRC} alt="Taj Mahal at sunrise" width={160} testID="image-a11y-labelled" />
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="image-qa-bug-repro" title="BUG-IMAGE-001 — interactive + disabled semantics" overflow>
        <p className={styles.storySectionLead}>
          Must expose <code>&lt;button disabled&gt;</code> for assistive tech when both props are set. Today code
          renders a non-interactive <code>role=&quot;img&quot;</code> div.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <Image
              src={SAMPLE_SRC}
              alt="Disabled gallery"
              interactive
              disabled
              width={120}
              testID="image-bug-interactive-disabled"
            />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="image-qa-radius" title="7 Radius (Figma) — token override ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>radius</code> presets are not a prop; use <code>--Image-borderRadius</code> via inline style.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <Image
              src={SAMPLE_SRC}
              alt="Rounded"
              width={140}
              style={{ '--Image-borderRadius': 'var(--Shape-L)' } as CSSProperties}
              testID="image-radius-token"
            />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
