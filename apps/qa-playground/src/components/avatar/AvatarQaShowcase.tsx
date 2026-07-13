'use client';

import type { CSSProperties } from 'react';
import { Avatar } from '@oneui/ui/components/Avatar';
import type { AvatarAppearance, AvatarAttention, AvatarProps, AvatarSize } from '@oneui/ui/components/Avatar';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Same sample as {@link packages/ui/src/components/Avatar/Avatar.showcase.tsx}. */
const SAMPLE_IMAGE =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

const appearanceRowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

/** Figma size labels ↔ code `size` (lowercase). */
const FIGMA_SIZES: { figma: string; size: AvatarSize }[] = [
  { figma: '2XS', size: '2xs' },
  { figma: 'XS', size: 'xs' },
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
  { figma: 'XL', size: 'xl' },
  { figma: '2XL', size: '2xl' },
];

/** IcProfile-style icon — {@link packages/ui/src/components/Avatar/Avatar.stories.tsx}. */
function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Figma appearance table (+ `auto`). */
const FIGMA_APPEARANCE = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly AvatarAppearance[];

type ComboRow = { caption: string; props: AvatarProps };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'M · image · high · primary', props: { content: 'image', src: SAMPLE_IMAGE, alt: 'User', size: 'm', attention: 'high', appearance: 'primary' } },
  { caption: 'L · icon · medium · secondary', props: { content: 'icon', alt: 'User', size: 'l', attention: 'medium', appearance: 'secondary', icon: <PersonIcon /> } },
  { caption: 'XL · text · low · neutral', props: { content: 'text', alt: 'Alex Rivera', size: 'xl', attention: 'low', appearance: 'neutral' } },
  { caption: 'M · image · disabled', props: { content: 'image', src: SAMPLE_IMAGE, alt: 'User', size: 'm', disabled: true } },
  { caption: 'S · icon · positive · high', props: { content: 'icon', alt: 'User', size: 's', appearance: 'positive', attention: 'high', icon: <PersonIcon /> } },
];

/**
 * Avatar QA playground — Figma API sections, code-only notes, combination matrix.
 * `data-testid` is forwarded on the root Avatar span only ({@link packages/ui/src/components/Avatar/Avatar.tsx}).
 */
export function AvatarQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="avatar-qa-default" title="Default" centerContent>
        <Avatar
          content="image"
          src={SAMPLE_IMAGE}
          alt="John Doe"
          size="m"
          attention="high"
          data-testid="avatar-default"
        />
      </QaStoryBand>

      <QaStoryBand id="avatar-qa-size" title="1 Size (2XS · XS · S · M · L · XL · 2XL · custom)" overflow>
        <p className={styles.storySectionLead}>
          Figma uses uppercase size labels; code uses lowercase <code>size</code> (<code>2xs</code> … <code>2xl</code>).{' '}
          <strong>custom</strong> uses <code>size=&quot;custom&quot;</code> with <code>customSize</code> (pixels) — same as{' '}
          <code>Avatar.stories.tsx</code> / <code>Avatar.showcase.tsx</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <Avatar
                  content="icon"
                  alt="User"
                  size={size}
                  attention="high"
                  appearance="primary"
                  icon={<PersonIcon />}
                  data-testid={`avatar-size-${figma.replace(/\s/g, '')}`}
                />
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
            <div className={styles.scenarioLabeledCell}>
              <Avatar
                content="icon"
                alt="User"
                size="custom"
                customSize={48}
                attention="high"
                appearance="primary"
                icon={<PersonIcon />}
                data-testid="avatar-size-custom"
              />
              <span className={styles.scenarioCellCaption}>size: custom (customSize)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="avatar-qa-attention" title="2 Attention (high · medium · low)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>Avatar.stories.tsx</code> Attention Levels — icon variant, primary appearance.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['high', 'medium', 'low'] as const satisfies readonly AvatarAttention[]).map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <Avatar
                  content="icon"
                  alt="User"
                  size="xl"
                  attention={attention}
                  appearance="primary"
                  icon={<PersonIcon />}
                  data-testid={`avatar-attention-${attention}`}
                />
                <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="avatar-qa-appearance" title="3 Appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          One icon avatar per role (<code>size=&quot;m&quot;</code>, <code>attention=&quot;high&quot;</code>). Code also supports{' '}
          <code>brand-bg</code> (not in this Figma table) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <Avatar
                  content="icon"
                  alt="User"
                  size="m"
                  attention="high"
                  appearance={appearance}
                  icon={<PersonIcon />}
                  data-testid={`avatar-appearance-${appearance}`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <Avatar
              content="icon"
              alt="User"
              size="m"
              attention="high"
              appearance="brand-bg"
              icon={<PersonIcon />}
              data-testid="avatar-appearance-brand-bg"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="avatar-qa-content" title="4 Content (Figma)" overflow>
        <p className={styles.storySectionLead}>
          Figma property <code>content</code> maps to the <code>content</code> prop: <code>image</code>, <code>icon</code>,{' '}
          <code>text</code> (initials from <code>alt</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['image', 'icon', 'text'] as const).map((content) => (
              <div key={content} className={styles.scenarioLabeledCell}>
                <Avatar
                  content={content}
                  alt="Jordan Smith"
                  size="xl"
                  attention="high"
                  appearance="primary"
                  src={content === 'image' ? SAMPLE_IMAGE : undefined}
                  icon={content === 'icon' ? <PersonIcon /> : undefined}
                  data-testid={`avatar-content-${content}`}
                />
                <span className={styles.scenarioCellCaption}>{`content: ${content}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="avatar-qa-accent" title="5 accent (code-only — not on Avatar)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: Figma documents `accent` (primary | secondary | sparkle); Avatar has no `accent` prop — use `appearance` for role colour. */}
          Figma API column: <strong>N/A</strong> for variable binding; <code>Avatar</code> has no <code>accent</code> prop. Below uses{' '}
          <code>appearance=&quot;primary&quot; | &quot;secondary&quot; | &quot;sparkle&quot;</code> as a visual stand-in (same pattern as Badge QA accent band). Code only — not a separate Avatar API ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Avatar content="icon" alt="User" size="xl" attention="high" appearance="primary" icon={<PersonIcon />} data-testid="avatar-accent-standin-primary" />
              <span className={styles.scenarioCellCaption}>appearance=primary (stand-in)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Avatar content="icon" alt="User" size="xl" attention="high" appearance="secondary" icon={<PersonIcon />} data-testid="avatar-accent-standin-secondary" />
              <span className={styles.scenarioCellCaption}>appearance=secondary (stand-in)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Avatar content="icon" alt="User" size="xl" attention="high" appearance="sparkle" icon={<PersonIcon />} data-testid="avatar-accent-standin-sparkle" />
              <span className={styles.scenarioCellCaption}>appearance=sparkle (stand-in)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="avatar-qa-disabled" title="6 disabled" overflow>
        <p className={styles.storySectionLead}>
          In Figma, <code>disabled</code> is a variable mode; in code it is the <code>disabled</code> prop.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Avatar content="icon" alt="User" size="xl" disabled={false} icon={<PersonIcon />} data-testid="avatar-disabled-false" />
              <span className={styles.scenarioCellCaption}>disabled: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Avatar content="icon" alt="User" size="xl" disabled icon={<PersonIcon />} data-testid="avatar-disabled-true" />
              <span className={styles.scenarioCellCaption}>disabled: true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="avatar-qa-combos" title="7 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <Avatar {...row.props} data-testid={`avatar-combo-${index}`} />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
