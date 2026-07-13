'use client';

/**
 * Input.showcase.tsx
 *
 * Shared variant display components for Input family.
 * Imported by both Storybook stories and the platform documentation page.
 *
 * Rules:
 * - No Storybook imports
 * - No platform (app) imports
 * - All styling via CSS custom property tokens
 */

import React from 'react';
import { Field } from '@base-ui/react/field';
import { InputField } from '../InputField/InputField';
import { InputFeedback, InputDynamicText } from './internals';
import { IconButton } from '../IconButton';
import { Surface } from '../Surface';

// ─── Shared layout helpers ────────────────────────────────────────────────────

const column: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  color: 'var(--Text-Low)',
};

const labeledItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 'var(--Spacing-4)',
};

// Generic icons — NOT search (avoid confusion with Search component)
// Using star/heart/close icons from the Figma Wishlist/close pattern
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
  </svg>
);

// SVG icons used DIRECTLY inside Input's slot wrappers (.start, .end) which
// have explicit width/height via the CSS module. Inline width:100% / height:100%
// lets the svg fill the slot wrapper. These SVGs should never be passed to
// IconButton's `icon` prop — use a semantic icon name string (e.g. "microphone")
// instead so IconButton's internal Icon component handles its own sizing.
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor" />
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
  </svg>
);

// Inline mini "avatar" — flat circle with a person glyph — stands in for an
// <Avatar> component slot so the showcase has no cross-component dependency.
const AvatarGlyph = () => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      borderRadius: 'var(--Shape-Pill)',
      backgroundColor: 'var(--Neutral-Subtle, var(--Surface-Minimal))',
      color: 'var(--Neutral-Medium-Text, var(--Text-Medium))',
    }}
  >
    <span style={{ width: '70%', height: '70%', display: 'inline-flex' }}>
      <PersonIcon />
    </span>
  </span>
);

// ─── Exported showcase components ─────────────────────────────────────────────

/**
 * All sizes — XS, S, M, L (InputField sizes)
 * Radius tokens per Figma DNA spec (S breakpoint, default density reference):
 *   S  → Shape-2 → Dimension-f-4 (8 px mobile, 10   px desktop 1920)
 *   M  → Shape-2 → Dimension-f-4 (8 px mobile, 10   px desktop 1920)
 *   L  → Shape-3  → Dimension-f-2 (12 px mobile, 15  px desktop 1920)
 *
 * The readout next to each row shows the LIVE computed value — so you can
 * verify what the cascade is actually resolving to at the current
 * platform/density combo.
 */
export function InputFieldSizes() {
  const rows = [
    { label: 'xs', size: 6 as const, token: 'Shape-0-5', dim: 'Dimension-f-7' },
    { label: 's', size: 8 as const, token: 'Shape-2', dim: 'Dimension-f-4' },
    { label: 'm', size: 10 as const, token: 'Shape-2', dim: 'Dimension-f-4' },
    { label: 'l', size: 12 as const, token: 'Shape-3', dim: 'Dimension-f-2' },
  ];

  return (
    <div style={column}>
      {rows.map((row) => (
        <SizeDebugRow key={row.label} {...row} />
      ))}
    </div>
  );
}

function SizeDebugRow({
  label,
  size,
  token,
  dim,
}: {
  label: string;
  size: 6 | 8 | 10 | 12;
  token: string;
  dim: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [resolved, setResolved] = React.useState<{
    radius: string;
    height: string;
    tokenValue: string;
    dimValue: string;
  } | null>(null);

  React.useLayoutEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;
    const inputBox = wrapper.querySelector<HTMLElement>('[data-size]');
    if (!inputBox) return;
    const read = () => {
      const cs = getComputedStyle(inputBox);
      const rootCs = getComputedStyle(document.documentElement);
      setResolved({
        radius: cs.borderRadius,
        height: cs.height,
        tokenValue: rootCs.getPropertyValue(`--${token}`).trim(),
        dimValue: rootCs.getPropertyValue(`--${dim}`).trim(),
      });
    };
    read();
    // Re-read whenever platform/density changes (data attrs flip on <html>)
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-Breakpoint', 'data-6-Density', 'data-density', 'data-mode'],
    });
    return () => observer.disconnect();
  }, [size, token, dim]);

  const debugStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--Spacing-3-5)',
    flexWrap: 'wrap',
    fontFamily: 'var(--Typography-Font-Code)',
    fontSize: 'var(--Label-XS-FontSize)',
    color: 'var(--Text-Low)',
  };

  return (
    <div ref={ref} style={labeledItem}>
      <span style={labelStyle}>{label.toUpperCase()} (f{size})</span>
      <InputField size={size} label="Label" placeholder={`Size ${label.toUpperCase()}`} start={<HeartIcon />} />
      <div style={debugStyle}>
        <span>border-radius: {token} → {dim}</span>
        <span>|</span>
        <span>token: {resolved?.tokenValue || '—'}</span>
        <span>|</span>
        <span>dim: {resolved?.dimValue || '—'}</span>
        <span>|</span>
        <span>computed: {resolved?.radius || '—'}</span>
        <span>|</span>
        <span>height: {resolved?.height || '—'}</span>
      </div>
    </div>
  );
}

/**
 * Attention variants — medium (outlined, default) vs high (filled).
 * Shows all sizes across both attention levels, so the filled variant
 * (Figma `attention=high`) is visible alongside the outlined default.
 */
export function InputFieldAttentions() {
  const sizes = [
    ['xs', 6],
    ['s', 8],
    ['m', 10],
    ['l', 12],
  ] as const;
  const attentions = ['medium', 'high'] as const;

  return (
    <div style={column}>
      {attentions.map((attention) => (
        <div key={attention} style={labeledItem}>
          <span style={labelStyle}>
            {attention} {attention === 'high' ? '(filled)' : '(outlined)'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
            {sizes.map(([label, size]) => (
              <InputField
                key={`${attention}-${label}`}
                size={size}
                attention={attention}
                label={`Label ${label.toUpperCase()}`}
                placeholder={`Size ${label.toUpperCase()}`}
                start={<HeartIcon />}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * All visual states
 */
export function InputFieldStates() {
  return (
    <div style={grid}>
      <div style={labeledItem}>
        <span style={labelStyle}>Idle</span>
        <InputField label="Label" placeholder="Placeholder" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Filled</span>
        <InputField label="Label" defaultValue="Input text" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Disabled</span>
        <InputField label="Label" placeholder="Disabled" disabled />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Read-only</span>
        <InputField label="Label" defaultValue="Read-only value" readOnly />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Error</span>
        <InputField label="Label" placeholder="Error state" error="Feedback message" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>With description</span>
        <InputField label="Label" description="Description text" placeholder="With description" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Required</span>
        <InputField label="Label" placeholder="Required field" required />
      </div>
    </div>
  );
}

/**
 * 4-slot system demos
 */
export function InputFieldWithSlots() {
  return (
    <div style={column}>
      <div style={labeledItem}>
        <span style={labelStyle}>Start icon</span>
        <InputField label="Label" start={<HeartIcon />} placeholder="With start icon" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Start + end icons</span>
        <InputField label="Label" start={<StarIcon />} end={<CloseIcon />} placeholder="Start and end" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Start2 (prefix text)</span>
        <InputField label="Amount" start2={<span>$</span>} placeholder="0.00" type="number" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>End2 (suffix text)</span>
        <InputField label="Weight" end2={<span>kg</span>} placeholder="Enter weight" type="number" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>All 4 slots</span>
        <InputField
          label="Amount"
          start={<StarIcon />}
          start2={<span>$</span>}
          end2={<span>.00</span>}
          end={<CloseIcon />}
          placeholder="Enter amount"
        />
      </div>
    </div>
  );
}

/**
 * All 8 appearance roles
 */
export function InputFieldAppearances() {
  const roles = [
    'primary', 'secondary', 'neutral', 'sparkle',
    'positive', 'negative', 'warning', 'informative',
  ] as const;

  return (
    <div style={grid}>
      {roles.map((role) => (
        <div key={role} style={labeledItem}>
          <span style={labelStyle}>{role}</span>
          <InputField label="Label" appearance={role} placeholder="Placeholder" />
        </div>
      ))}
    </div>
  );
}

/**
 * Figma-aligned composition: string `label`, `feedback`, `dynamicTextSlot`.
 */
export function InputFieldSlotsComposition() {
  return (
    <div style={column}>
      <InputField
        label="Label"
        placeholder="Placeholder"
        start={<HeartIcon />}
        feedback={
          <InputFeedback variant="negative" attention="low" feedback_message="Feedback message" />
        }
        dynamicTextSlot={<InputDynamicText size="m" content="Dynamic text" end="Helper Button" />}
      />
    </div>
  );
}

/**
 * InputFeedback — all variants x attention levels
 */
export function InputFeedbackShowcase() {
  const variants = ['negative', 'positive', 'warning', 'informative'] as const;
  const attentions = ['low', 'medium', 'high'] as const;
  const sizes = ['s', 'm', 'l'] as const;

  return (
    <div style={column}>
      {variants.map((variant) => (
        <div key={variant} style={labeledItem}>
          <span style={labelStyle}>{variant}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            {sizes.map((size) => (
              <div
                key={`${variant}-${size}`}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}
              >
                <span style={{ ...labelStyle, fontSize: 'var(--Label-XS-FontSize)' }}>size: {size}</span>
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap' }}>
                  {attentions.map((attention) => (
                    <InputFeedback
                      key={`${variant}-${size}-${attention}`}
                      variant={variant}
                      attention={attention}
                      size={size}
                      feedback_message="Feedback message"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * InputDynamicText — Figma DynamicText row (S / M / L): leading copy + optional trailing button.
 */
export function InputDynamicTextShowcase() {
  return (
    <div style={column}>
      <div style={labeledItem}>
        <span style={labelStyle}>Dynamic text only</span>
        <InputDynamicText size="m" content="0/100 characters" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>End button only</span>
        <InputDynamicText size="m" end="Help" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Both</span>
        <InputDynamicText size="m" content="0/100 characters" end="Learn more" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Sizes (S / M / L) — Figma row</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <InputDynamicText size="s" content="Dynamic text" end="Helper Button" />
          <InputDynamicText size="m" content="Dynamic text" end="Helper Button" />
          <InputDynamicText size="l" content="Dynamic text" end="Helper Button" />
        </div>
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Content only</span>
        <InputDynamicText size="m" content="0 / 280 characters" />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>End button only (alt)</span>
        <InputDynamicText size="m" end="Helper Button" />
      </div>
    </div>
  );
}

/**
 * Full InputField composition
 */
export function InputFieldFullComposition() {
  return (
    <div style={column}>
      <InputField
        label="Email"
        description="Shown under the label row (field description)."
        placeholder="you@example.com"
        type="email"
        start={<StarIcon />}
        feedback={
          <InputFeedback variant="informative" attention="low" feedback_message="Optional field hint" />
        }
        dynamicText="0 / 100 characters"
        helperButton="Help"
      />
      <InputField
        label="Password"
        placeholder="Enter password"
        type="password"
        error="Password must be at least 8 characters"
        required
      />
    </div>
  );
}

/**
 * Shape variants — default vs pill
 */
export function InputFieldShapes() {
  return (
    <div style={column}>
      <div style={labeledItem}>
        <span style={labelStyle}>Default shape</span>
        <InputField label="Default" shape="default" placeholder="Rounded" start={<HeartIcon />} />
      </div>
      <div style={labeledItem}>
        <span style={labelStyle}>Pill shape</span>
        <InputField label="Pill" shape="pill" placeholder="Fully rounded" start={<HeartIcon />} />
      </div>
    </div>
  );
}

/**
 * Surface context — each row uses `<Surface mode="…" appearance="secondary">`
 * so InputField picks up the real surface cascade (not a raw `div` +
 * `data-surface` only). Default row keeps a dashed outline via inline style so
 * it still reads as “page” in QA sweeps.
 */
export function InputFieldSurfaceContext() {
  const appearances = ['primary', 'secondary', 'neutral', 'positive', 'warning', 'informative'] as const;

  const surfaceRows = (appearance: string) => [
    {
      mode: 'default' as const,
      label: 'default',
      desc: 'page background — default surface context',
      surfaceStyle: {
        backgroundColor: 'transparent',
        border: '1px dashed var(--Neutral-Stroke-Low, var(--Text-Low))',
      },
    },
    {
      mode: 'minimal' as const,
      label: 'minimal',
      desc: `lightest ${appearance} tint`,
    },
    {
      mode: 'subtle' as const,
      label: 'subtle',
      desc: `light ${appearance} tint`,
    },
    {
      mode: 'moderate' as const,
      label: 'moderate',
      desc: `medium ${appearance} tint`,
    },
    {
      mode: 'bold' as const,
      label: 'bold',
      desc: `full ${appearance} accent colour`,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-8)' }}>
      {appearances.map((appearance) => (
        <div key={appearance} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
          <h3 style={{ ...labelStyle, fontSize: 'var(--Title-M-FontSize)', lineHeight: 'var(--Title-M-LineHeight)', fontWeight: 'var(--Title-M-FontWeight)', margin: 0, textTransform: 'capitalize', color: 'var(--Text-High)' }}>
            {appearance} Appearance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
            {surfaceRows(appearance).map(({ mode, label, desc, surfaceStyle }) => (
              <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                <span style={labelStyle}>{label} — {desc}</span>
                <Surface
                  mode={mode}
                  appearance={appearance}
                  style={{
                    padding: 'var(--Spacing-4-5)',
                    borderRadius: 'var(--Shape-4)',
                    width: '100%',
                    ...surfaceStyle,
                  }}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: 'var(--Spacing-6)' 
                  }}>
                    <InputField
                      label="Medium (outlined)"
                      placeholder={`Medium on ${label}`}
                      start={<HeartIcon />}
                    />
                    <InputField
                      label="High (filled)"
                      attention="high"
                      placeholder={`Filled on ${label}`}
                      start={<HeartIcon />}
                    />
                  </div>
                </Surface>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Search — slot-system variations.
 *
 * Demonstrates every combination of the 4-slot system (start, start2, end,
 * end2) using search-flavoured content that mirrors the DNA frame at Figma
 * node 4306:7247. Designers can scan every slot permutation in one place and
 * compose their own patterns from the building blocks shown here.
 *
 * Slot recap:
 *   start   — leading icon / avatar / image / chip (24 × 24 at M)
 *   start2  — leading text (prefix, currency symbol) — no width constraint
 *   end     — trailing icon / icon button / action button
 *   end2    — trailing text (suffix, unit, counter)
 */
export function InputFieldSearch() {
  // IconButton size rule: match Input size 1:1 so the icon inside the
  // trailing IconButton renders at the same pixel size as the leading
  // icon slot. Per IconButton.module.css:
  //   size=8 → container 32, icon 16 (S Input)
  //   size=10 → container 40, icon 20 (M Input)
  //   size=12 → container 48, icon 24 (L Input)
  // Previous revision used the smallest size everywhere → trailing icon looked too small
  // against the 20px leading search icon at size M.
  const TRAILING_M = 10 as const;

  return (
    <div style={column}>
      <div style={labeledItem}>
        <span style={labelStyle}>Search icon only (leading)</span>
        <InputField label="Search" shape="pill" start={<SearchIcon />} placeholder="Search products, brands, categories…" />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Search + clear icon button (trailing)</span>
        <InputField
          label="Search"
          shape="pill"
          start={<SearchIcon />}
          end={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Clear search"
              appearance="secondary"
              icon="close"
            />
          }
          defaultValue="Sneakers"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Search + voice (mic icon button)</span>
        <InputField
          label="Search"
          shape="pill"
          start={<SearchIcon />}
          end={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Voice search"
              appearance="secondary"
              icon="microphone"
            />
          }
          placeholder="Say or type to search"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Search + clear + voice (two trailing slots)</span>
        <InputField
          label="Search"
          shape="pill"
          start={<SearchIcon />}
          end2={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Clear search"
              appearance="secondary"
              icon="close"
            />
          }
          end={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Voice search"
              appearance="secondary"
              icon="microphone"
            />
          }
          defaultValue="Ocean freight"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Search + filter</span>
        <InputField
          label="Search"
          shape="pill"
          start={<SearchIcon />}
          end={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Filters"
              appearance="secondary"
              icon="filter"
            />
          }
          placeholder="Search results"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Result counter (end2 text)</span>
        <InputField
          label="Search"
          shape="pill"
          start={<SearchIcon />}
          end2={<span style={{ color: 'var(--Text-Low)' }}>42 results</span>}
          defaultValue="Organic"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Back button + search (leading action)</span>
        <InputField
          label="Search"
          shape="pill"
          start={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Back"
              appearance="secondary"
              icon="arrowLeft"
            />
          }
          end={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Voice search"
              appearance="secondary"
              icon="microphone"
            />
          }
          placeholder="Search within category"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Avatar (start) + chevron (end) — user picker</span>
        <InputField
          label="Assign to"
          shape="pill"
          start={<AvatarGlyph />}
          end={<ChevronRightIcon />}
          placeholder="Select a teammate"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Currency prefix + unit suffix — no icons</span>
        <InputField
          label="Amount"
          shape="pill"
          start2={<span style={{ color: 'var(--Text-Low)' }}>$</span>}
          end2={<span style={{ color: 'var(--Text-Low)' }}>USD</span>}
          placeholder="0.00"
          type="number"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>All 4 slots — search with currency-style affordances</span>
        <InputField
          label="Catalog query"
          shape="pill"
          start={<SearchIcon />}
          start2={<span style={{ color: 'var(--Text-Low)' }}>SKU</span>}
          end2={<span style={{ color: 'var(--Text-Low)' }}>US</span>}
          end={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Clear search"
              appearance="secondary"
              icon="close"
            />
          }
          defaultValue="1024-OR-B"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>Filled (attention=high) — search variant</span>
        <InputField
          label="Search"
          shape="pill"
          attention="high"
          start={<SearchIcon />}
          end={
            <IconButton
              attention="low"
              size={TRAILING_M}
              aria-label="Voice search"
              appearance="secondary"
              icon="microphone"
            />
          }
          placeholder="Search across everything"
        />
      </div>

      <div style={labeledItem}>
        <span style={labelStyle}>All sizes, same search composition</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
          {([6, 8, 10, 12] as const).map((size) => (
            <InputField
              key={size}
              size={size}
              shape="pill"
              label={`Size ${size === 6 ? 'XS' : size === 8 ? 'S' : size === 10 ? 'M' : 'L'}`}
              start={<SearchIcon />}
              end={
                <IconButton
                  attention="low"
                  size={size}
                  aria-label="Voice search"
                  appearance="secondary"
                  icon="microphone"
                />
              }
              placeholder="Search products"
            />
          ))}
        </div>
      </div>
    </div>
  );
}