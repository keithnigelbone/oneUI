/**
 * Foundations / Strokes
 *
 * Read-only visualization of the Stroke token system. Two tiers:
 *   1. Static strokes (None → 2XL): fixed px values, stay crisp at all densities
 *   2. Dynamic strokes (3XL → 9XL): aliased to --Dimension-f{N}, scale with
 *      platform and density like spacing and typography
 *
 * Every row reads the actual resolved value from `getComputedStyle` so you
 * can watch the dynamic tier shift when you toggle platform or density.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { STROKE_SCALE_TOKENS } from '@oneui/shared';

const meta: Meta = {
  title: 'Foundations/Strokes',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Stroke token system. Static strokes (None → 2XL) are pinned px ' +
          'values for crisp hairlines. Dynamic strokes (3XL → 9XL) alias ' +
          'into the dimension f-scale so they respond to platform + density ' +
          'changes.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

// ─── Token catalog ────────────────────────────────────────────────────────

type StrokeToken = (typeof STROKE_SCALE_TOKENS)[number];

const STATIC_STROKES: StrokeToken[] = STROKE_SCALE_TOKENS
  .filter((stroke) => stroke.kind === 'fixed')
  .map((stroke) => stroke);

const DYNAMIC_STROKES: StrokeToken[] = STROKE_SCALE_TOKENS
  .filter((stroke) => stroke.kind === 'dimension')
  .map((stroke) => stroke);

// ─── Shared styles ────────────────────────────────────────────────────────

const tableGridColumns = 'minmax(var(--Spacing-8), 0.55fr) minmax(var(--Spacing-20), 2fr) minmax(var(--Spacing-20), 1.25fr) minmax(var(--Spacing-10), 0.75fr) minmax(var(--Spacing-18), 1fr)';

const codeStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Code)',
  fontSize: 'var(--Label-XS-FontSize)',
  color: 'var(--Text-Low)',
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  color: 'var(--Text-High)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
};

const valueStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Code)',
  fontSize: 'var(--Label-S-FontSize)',
  color: 'var(--Text-High)',
  fontWeight: 600,
  textAlign: 'right',
};

const noteStyle: React.CSSProperties = {
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  color: 'var(--Text-Medium)',
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--Title-M-FontSize)',
  lineHeight: 'var(--Title-M-LineHeight)',
  color: 'var(--Text-High)',
};

const sectionDescription: React.CSSProperties = {
  margin: 'var(--Spacing-2-5) 0 0',
  fontSize: 'var(--Body-S-FontSize)',
  color: 'var(--Text-Medium)',
};

function useResolvedStrokeWidth(cssVar: string) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      setValue(getComputedStyle(el).borderTopWidth.trim());
    };

    read();
    const htmlObserver = new MutationObserver(read);
    htmlObserver.observe(document.documentElement, { attributes: true });
    return () => htmlObserver.disconnect();
  }, [cssVar]);

  return [ref, value] as const;
}

function getStrokeNote(token: StrokeToken): string {
  return token.kind === 'fixed' ? 'Fixed' : token.value;
}

function getDisplayValue(token: StrokeToken, resolved: string): string {
  return token.kind === 'fixed' ? token.value : resolved || token.value;
}

// ─── Row primitive: size | preview | token | value | notes ────────────────

interface StrokeRowProps {
  token: StrokeToken;
}

function StrokeRow({ token }: StrokeRowProps) {
  const [previewRef, resolved] = useResolvedStrokeWidth(token.cssVar);
  const isNone = token.value === '0px';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: tableGridColumns,
        alignItems: 'center',
        gap: 'var(--Spacing-3-5)',
        padding: 'var(--Spacing-3-5) 0',
        borderBottom: 'var(--Stroke-S) solid var(--Border-Subtle, var(--Neutral-Stroke-Low))',
      }}
    >
      <span style={nameStyle}>{token.key}</span>
      <div>
        {isNone ? (
          <span style={codeStyle}>-</span>
        ) : (
          <div
            ref={previewRef}
            style={{
              width: '100%',
              height: 0,
              borderTopStyle: 'solid',
              borderTopWidth: `var(${token.cssVar})`,
              borderTopColor: 'var(--Text-High)',
            }}
          />
        )}
      </div>
      <code style={codeStyle}>{token.cssVar}</code>
      <span style={valueStyle}>{getDisplayValue(token, resolved)}</span>
      <span style={noteStyle}>{getStrokeNote(token)}</span>
    </div>
  );
}

function HeaderRow() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: tableGridColumns,
        alignItems: 'center',
        gap: 'var(--Spacing-3-5)',
        padding: 'var(--Spacing-3) 0',
        borderBottom: 'var(--Stroke-M) solid var(--Border-Subtle, var(--Neutral-Stroke-Medium))',
      }}
    >
      <span style={codeStyle}>Size</span>
      <span style={codeStyle}>Preview</span>
      <span style={codeStyle}>Token</span>
      <span style={{ ...codeStyle, textAlign: 'right' }}>Value</span>
      <span style={codeStyle}>Notes</span>
    </div>
  );
}

interface StrokeTableProps {
  sections: Array<{
    title: string;
    tokens: StrokeToken[];
  }>;
}

function StrokeTable({ sections }: StrokeTableProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <HeaderRow />
      {sections.map((section) => (
        <React.Fragment key={section.title}>
          <div
            style={{
              padding: 'var(--Spacing-3) 0',
              borderBottom: 'var(--Stroke-S) solid var(--Border-Subtle, var(--Neutral-Stroke-Low))',
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
              color: 'var(--Text-High)',
            }}
          >
            {section.title}
          </div>
          {section.tokens.map((token) => (
            <StrokeRow key={token.token} token={token} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Full overview — static + dynamic in one page ────────────────────────

export const AllStrokes: Story = {
  name: 'All strokes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-7)' }}>
      <header>
        <h2 style={sectionTitle}>Stroke Tokens</h2>
        <p style={sectionDescription}>
          Static tokens are fixed pixel values. Dynamic tokens alias dimension
          f-steps and adapt to the active platform and density.
        </p>
      </header>

      <StrokeTable
        sections={[
          { title: 'Static', tokens: STATIC_STROKES },
          { title: 'Dynamic', tokens: DYNAMIC_STROKES },
        ]}
      />
    </div>
  ),
};

// ─── Static tier ──────────────────────────────────────────────────────────

export const StaticStrokes: Story = {
  name: 'Static strokes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <header>
        <h2 style={sectionTitle}>Static Stroke Tokens</h2>
        <p style={sectionDescription}>
          Fixed pixel values pinned for crisp rendering at all densities.
        </p>
      </header>
      <StrokeTable sections={[{ title: 'Static', tokens: STATIC_STROKES }]} />
    </div>
  ),
};

// ─── Dynamic tier ─────────────────────────────────────────────────────────

export const DynamicStrokes: Story = {
  name: 'Dynamic strokes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <header>
        <h2 style={sectionTitle}>Dynamic Stroke Tokens</h2>
        <p style={sectionDescription}>
          Aliased to <code>--Dimension-f&#123;N&#125;</code> so they scale
          with platform and density like spacing and typography.
        </p>
      </header>
      <StrokeTable sections={[{ title: 'Dynamic', tokens: DYNAMIC_STROKES }]} />
    </div>
  ),
};
