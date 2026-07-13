/**
 * InputFeedback QA tests — smoke, functional, and a11y.
 *
 * Source: packages/ui-native/src/components/InputFeedback/InputFeedback.native.tsx
 *
 * ─── Props ────────────────────────────────────────────────────────────────────
 *
 *   variant          'negative'(default)|'positive'|'warning'|'informative'
 *   attention        'low'(default)|'medium'|'high'
 *   size             's'|'m'(default)|'l'
 *   feedback_message string — primary text content (Figma prop name, snake_case)
 *   children         ReactNode — fallback when feedback_message is absent/empty
 *   customIcon       ReactNode — overrides per-variant default icon
 *                    (string customIcon → console.warn + dropped)
 *   role             'alert'|'status'|'none' — overrides default a11y role
 *   aria-label       string — overrides accessibilityLabel
 *   aria-hidden      boolean — hides from a11y tree
 *   aria-describedby string — web parity, forwarded
 *   accessibilityHint string
 *   testID
 *
 * ─── Returns null when ────────────────────────────────────────────────────────
 *
 *   !hasMessage AND customIcon == null
 *     (empty feedback_message, no children, no customIcon → renders nothing)
 *

 * ─── Message precedence ───────────────────────────────────────────────────────
 *
 *   feedback_message non-empty → uses feedback_message (children ignored)
 *   feedback_message absent/empty → uses children
 *
 * ─── A11y model ──────────────────────────────────────────────────────────────
 *
 *   negative  → accessibilityRole='alert'  + accessibilityLiveRegion='assertive'
 *   positive  → accessibilityLiveRegion='polite'   (no specific role)
 *   warning   → accessibilityLiveRegion='polite'   (no specific role)
 *   informative → accessibilityLiveRegion='polite' (no specific role)
 *   role='none' → accessibilityLiveRegion='none'
 *
 *   Container: accessible=true, accessibilityLabel from aria-label or feedback_message
 *   Icon slot: accessibilityElementsHidden=true (decorative)
 *   Message Text: accessible=false (container carries the a11y)
 *
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import { InputFeedback } from '@ui-native/components/InputFeedback/InputFeedback.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const VARIANTS    = ['negative', 'positive', 'warning', 'informative'] as const;
const ATTENTIONS  = ['low', 'medium', 'high'] as const;
const SIZES       = ['s', 'm', 'l'] as const;
const TEST_MSG    = 'Field is required';

// ─── Figma matrix: variant × attention ───────────────────────────────────────
//
// Figma matrix: variant (4 rows) × attention (3 columns) = 12 cells.
// Each cell renders with a message for the visual sketch.

describe('InputFeedback — Figma matrix: variant × attention', () => {
  for (const variant of VARIANTS) {
    for (const attention of ATTENTIONS) {
      it(`[smoke] variant="${variant}" attention="${attention}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <InputFeedback
              variant={variant}
              attention={attention}
              feedback_message={TEST_MSG}
              testID="ifb-matrix"
            />,
          )),
        ).not.toThrow();
      });

      it(`[fn] variant="${variant}" attention="${attention}" — message visible and accessible`, () => {
        render(wrap(
          <InputFeedback
            variant={variant}
            attention={attention}
            feedback_message={TEST_MSG}
            testID="ifb-fn"
          />,
        ));
        expect(screen.getByText(TEST_MSG)).toBeTruthy();
        expect(screen.getByTestId('ifb-fn').props.accessible).toBe(true);
      });
    }
  }
});

// ─── Figma matrix: size ───────────────────────────────────────────────────────

describe('InputFeedback — Figma matrix: size', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <InputFeedback size={size} feedback_message={TEST_MSG} testID={`ifb-sz-${size}`} />,
        )),
      ).not.toThrow();
    });

    it(`[fn] size="${size}" — message visible`, () => {
      render(wrap(<InputFeedback size={size} feedback_message={TEST_MSG} />));
      expect(screen.getByText(TEST_MSG)).toBeTruthy();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('InputFeedback — smoke', () => {
  it('[smoke] renders with feedback_message', () => {
    render(wrap(<InputFeedback feedback_message="Error text" testID="ifb" />));
    expect(screen.getByTestId('ifb')).toBeTruthy();
    expect(screen.getByText('Error text')).toBeTruthy();
  });

  it('[smoke] renders with children when feedback_message absent', () => {
    render(wrap(<InputFeedback testID="ifb"><View testID="child-node" /></InputFeedback>));
    expect(screen.getByTestId('ifb')).toBeTruthy();
  });

  it('[smoke] renders null when no message and no customIcon', () => {
    // Component returns null — testID is never attached
    const { toJSON } = render(wrap(<InputFeedback testID="ifb-null" />));
    expect(screen.queryByTestId('ifb-null')).toBeNull();
  });

  it('[smoke] renders with customIcon ReactNode', () => {
    // customIcon is inside accessibilityElementsHidden=true wrapper → includeHiddenElements
    render(wrap(
      <InputFeedback
        feedback_message={TEST_MSG}
        customIcon={<View testID="custom-icon" />}
        testID="ifb"
      />,
    ));
    expect(screen.getByTestId('ifb')).toBeTruthy();
    expect(screen.getByTestId('custom-icon', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[smoke] renders all variants without crashing', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(wrap(
        <InputFeedback variant={variant} feedback_message={TEST_MSG} />,
      ));
      expect(screen.getByText(TEST_MSG)).toBeTruthy();
      unmount();
    }
    render(wrap(<InputFeedback feedback_message={TEST_MSG} />));
  });

  it('[smoke] renders all attentions without crashing', () => {
    for (const attention of ATTENTIONS) {
      const { unmount } = render(wrap(
        <InputFeedback attention={attention} feedback_message={TEST_MSG} />,
      ));
      unmount();
    }
    render(wrap(<InputFeedback feedback_message={TEST_MSG} />));
  });
});

// ─── Functional: message rendering ───────────────────────────────────────────

describe('InputFeedback — functional: message rendering', () => {
  it('[fn] feedback_message renders as visible text', () => {
    render(wrap(<InputFeedback feedback_message="Please enter a valid email" testID="ifb" />));
    expect(screen.getByText('Please enter a valid email')).toBeTruthy();
  });

  it('[fn] children renders when feedback_message is absent', () => {
    render(wrap(
      <InputFeedback testID="ifb">
        <View testID="rich-content" />
      </InputFeedback>,
    ));
    expect(screen.getByTestId('rich-content')).toBeTruthy();
  });

  it('[fn] string children renders as visible text', () => {
    render(wrap(<InputFeedback testID="ifb">Children text</InputFeedback>));
    expect(screen.getByText('Children text')).toBeTruthy();
  });

  it('[fn] feedback_message takes priority over children when both set', () => {
    render(wrap(
      <InputFeedback feedback_message="From prop">From children</InputFeedback>,
    ));
    // feedback_message wins:
    expect(screen.getByText('From prop')).toBeTruthy();
    expect(screen.queryByText('From children')).toBeNull();
  });

  it('[fn] empty feedback_message falls back to children', () => {
    render(wrap(
      <InputFeedback feedback_message="">From children fallback</InputFeedback>,
    ));
    // Empty feedback_message → children used:
    expect(screen.getByText('From children fallback')).toBeTruthy();
  });

  it('[fn] whitespace-only feedback_message falls back to children', () => {
    render(wrap(
      <InputFeedback feedback_message="   ">Fallback</InputFeedback>,
    ));
    expect(screen.getByText('Fallback')).toBeTruthy();
  });

  it('[fn] feedback_message is trimmed before rendering', () => {
    render(wrap(<InputFeedback feedback_message="  Error  " testID="ifb" />));
    // trim() is applied in useInputFeedbackState
    expect(screen.getByText('Error')).toBeTruthy();
  });

  it('[fn] returns null when neither message nor customIcon provided', () => {
    render(wrap(<InputFeedback testID="ifb-null" />));
    expect(screen.queryByTestId('ifb-null')).toBeNull();
  });

  it('[fn] returns null with empty string children', () => {
    render(wrap(<InputFeedback testID="ifb-null">{''}</InputFeedback>));
    expect(screen.queryByTestId('ifb-null')).toBeNull();
  });

  it('[fn] renders with only customIcon (no message) — icon-only mode', () => {
    // customIcon inside accessibilityElementsHidden → includeHiddenElements
    render(wrap(
      <InputFeedback customIcon={<View testID="icon-only" />} testID="ifb" />,
    ));
    // customIcon alone is enough to render the component:
    expect(screen.getByTestId('ifb')).toBeTruthy();
    expect(screen.getByTestId('icon-only', { includeHiddenElements: true })).toBeTruthy();
  });
});

// ─── Functional: a11y role and liveRegion ────────────────────────────────────

describe('InputFeedback — functional: a11y role and liveRegion', () => {
  it('[fn] negative → accessibilityRole="alert"', () => {
    render(wrap(
      <InputFeedback variant="negative" feedback_message={TEST_MSG} testID="ifb" />,
    ));
    expect(screen.getByTestId('ifb').props.accessibilityRole).toBe('alert');
  });

  it('[fn] negative → accessibilityLiveRegion="assertive"', () => {
    render(wrap(
      <InputFeedback variant="negative" feedback_message={TEST_MSG} testID="ifb" />,
    ));
    expect(screen.getByTestId('ifb').props.accessibilityLiveRegion).toBe('assertive');
  });

  it('[fn] positive → no accessibilityRole (polite liveRegion only)', () => {
    render(wrap(
      <InputFeedback variant="positive" feedback_message={TEST_MSG} testID="ifb" />,
    ));
    const el = screen.getByTestId('ifb');
    expect(el.props.accessibilityRole).toBeUndefined();
    expect(el.props.accessibilityLiveRegion).toBe('polite');
  });

  it('[fn] warning → accessibilityLiveRegion="polite"', () => {
    render(wrap(
      <InputFeedback variant="warning" feedback_message={TEST_MSG} testID="ifb" />,
    ));
    expect(screen.getByTestId('ifb').props.accessibilityLiveRegion).toBe('polite');
  });

  it('[fn] informative → accessibilityLiveRegion="polite"', () => {
    render(wrap(
      <InputFeedback variant="informative" feedback_message={TEST_MSG} testID="ifb" />,
    ));
    expect(screen.getByTestId('ifb').props.accessibilityLiveRegion).toBe('polite');
  });

  it('[fn] role="none" overrides default → liveRegion="none"', () => {
    render(wrap(
      <InputFeedback variant="negative" role="none" feedback_message={TEST_MSG} testID="ifb" />,
    ));
    const el = screen.getByTestId('ifb');
    expect(el.props.accessibilityRole).toBeUndefined();
    expect(el.props.accessibilityLiveRegion).toBe('none');
  });

  it('[fn] role="alert" override on non-negative → assertive liveRegion', () => {
    render(wrap(
      <InputFeedback variant="positive" role="alert" feedback_message={TEST_MSG} testID="ifb" />,
    ));
    const el = screen.getByTestId('ifb');
    expect(el.props.accessibilityRole).toBe('alert');
    expect(el.props.accessibilityLiveRegion).toBe('assertive');
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('InputFeedback — a11y', () => {
  it('[a11y] container accessible=true', () => {
    render(wrap(<InputFeedback feedback_message={TEST_MSG} testID="ifb" />));
    expect(screen.getByTestId('ifb').props.accessible).toBe(true);
  });

  it('[a11y] accessibilityLabel from feedback_message (string)', () => {
    render(wrap(<InputFeedback feedback_message="Invalid email" testID="ifb" />));
    expect(screen.getByTestId('ifb').props.accessibilityLabel).toBe('Invalid email');
  });

  it('[a11y] aria-label overrides feedback_message as accessibilityLabel', () => {
    render(wrap(
      <InputFeedback
        feedback_message="Error"
        aria-label="Custom label"
        testID="ifb"
      />,
    ));
    expect(screen.getByTestId('ifb').props.accessibilityLabel).toBe('Custom label');
  });

  it('[a11y] getByLabelText finds component via feedback_message', () => {
    render(wrap(<InputFeedback feedback_message="Field required" />));
    expect(screen.getByLabelText('Field required')).toBeTruthy();
  });

  it('[a11y] accessibilityHint forwarded to container', () => {
    render(wrap(
      <InputFeedback feedback_message={TEST_MSG} accessibilityHint="Fix this field" testID="ifb" />,
    ));
    expect(screen.getByTestId('ifb').props.accessibilityHint).toBe('Fix this field');
  });

  it('[a11y] aria-hidden=true → accessible=false, accessibilityElementsHidden=true', () => {
    render(wrap(
      <InputFeedback feedback_message={TEST_MSG} aria-hidden testID="ifb" />,
    ));
    const el = screen.getByTestId('ifb', { includeHiddenElements: true });
    expect(el.props.accessible).not.toBe(true);
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] aria-hidden element not findable by standard queries', () => {
    render(wrap(<InputFeedback feedback_message={TEST_MSG} aria-hidden testID="ifb" />));
    expect(screen.queryByTestId('ifb')).toBeNull();
  });

  it('[a11y] aria-describedby forwarded to container', () => {
    render(wrap(
      <InputFeedback feedback_message={TEST_MSG} aria-describedby="input-id" testID="ifb" />,
    ));
    expect(screen.getByTestId('ifb').props['aria-describedby']).toBe('input-id');
  });

  it('[a11y] message Text is accessible=false (container carries a11y)', () => {
    render(wrap(<InputFeedback feedback_message={TEST_MSG} testID="ifb" />));
    // The container is accessible; the Text is accessible=false (decorative):
    const container = screen.getByTestId('ifb');
    expect(container.props.accessible).toBe(true);
    // Children text has accessible=false — querying via UNSAFE to verify:
    const texts = screen.UNSAFE_getAllByProps({ accessible: false, importantForAccessibility: 'no' });
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  it('[a11y] negative variant announces assertively (assertive > polite for errors)', () => {
    render(wrap(
      <InputFeedback variant="negative" feedback_message="Form error" testID="ifb" />,
    ));
    // Negative = alert role + assertive = screen reader interrupts immediately:
    expect(screen.getByTestId('ifb').props.accessibilityLiveRegion).toBe('assertive');
    expect(screen.getByTestId('ifb').props.accessibilityRole).toBe('alert');
  });
});

