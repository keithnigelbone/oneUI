/**
 * ScopedPlatform.test.tsx
 *
 * The component is deliberately logic-free (attribute pass-through only),
 * so these tests lock in its contract:
 *   - Correct data-* attributes are written to the wrapper element
 *   - Explicit props always win over forwarded `...rest` spread
 *   - Children render unchanged
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScopedPlatform } from './ScopedPlatform';

describe('ScopedPlatform', () => {
  it('writes the resolved breakpointId / density / category to the wrapper', () => {
    render(
      <ScopedPlatform
        platformId="print"
        breakpointId="print-a4-portrait"
        density="compact"
        category="print"
        data-testid="wrapper"
      >
        <span>child</span>
      </ScopedPlatform>,
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper.getAttribute('data-6-Density')).toBe('compact');
    expect(wrapper.getAttribute('data-platform-category')).toBe('print');
    expect(wrapper.getAttribute('data-platform-id')).toBe('print');
    // Non-web breakpoint ids do not map to an S/M/L breakpoint.
    expect(wrapper.getAttribute('data-Breakpoint')).toBeNull();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('defaults density to "default" when not provided', () => {
    render(
      <ScopedPlatform platformId="web" breakpointId="S" data-testid="wrapper">
        <span>child</span>
      </ScopedPlatform>,
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper.getAttribute('data-6-Density')).toBe('default');
  });

  it('explicit props win over a rogue data-Breakpoint / density in rest props', () => {
    // Regression for review finding: if the caller passes data-Breakpoint /
    // data-6-Density via a spread, the explicit prop on the component MUST
    // win. The component writes these attributes imperatively (via ref +
    // setAttribute) after `{...rest}` is spread, so the resolved value always
    // overrides a rogue value from the spread.
    const rogueRest = {
      'data-Breakpoint': 'malicious-bp',
      'data-6-Density': 'malicious-density',
    };
    render(
      <ScopedPlatform
        platformId="web"
        breakpointId="S"
        density="compact"
        data-testid="wrapper"
        {...rogueRest}
      >
        <span>child</span>
      </ScopedPlatform>,
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper.getAttribute('data-Breakpoint')).toBe('S');
    expect(wrapper.getAttribute('data-6-Density')).toBe('compact');
  });

  it('renders as the polymorphic element specified by `as`', () => {
    render(
      <ScopedPlatform
        as="section"
        platformId="web"
        breakpointId="S"
        data-testid="wrapper"
      >
        <span>child</span>
      </ScopedPlatform>,
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper.tagName).toBe('SECTION');
  });

  it('wrapper matches the same CSS attribute selectors scale.css uses', () => {
    // The whole point of ScopedPlatform is to make `[data-Breakpoint="..."]`
    // selectors in scale.css apply to a subtree. This test uses `.matches()`
    // to assert the element is actually selectable by the same literal form
    // the CSS uses. HTML normalizes attribute names to lowercase in the DOM,
    // but CSS attribute-name matching is case-insensitive in HTML documents,
    // so both `[data-Breakpoint]` and `[data-breakpoint]` must match.
    render(
      <ScopedPlatform
        platformId="web"
        breakpointId="S"
        density="default"
        data-testid="wrapper"
      >
        <span>child</span>
      </ScopedPlatform>,
    );
    const wrapper = screen.getByTestId('wrapper');
    // Web breakpoints map to the canonical S/M/L attribute.
    expect(wrapper.getAttribute('data-Breakpoint')).toBe('S');
    // Both the PascalCase (scale.css literal) and lowercase forms match.
    expect(wrapper.matches('[data-Breakpoint="S"][data-6-Density="default"]')).toBe(true);
    expect(wrapper.matches('[data-breakpoint="S"][data-6-density="default"]')).toBe(true);
    // Values are case-sensitive per spec — wrong value should not match.
    expect(wrapper.matches('[data-Breakpoint="L"]')).toBe(false);
  });

  it('forwards className and style', () => {
    render(
      <ScopedPlatform
        platformId="web"
        breakpointId="S"
        className="custom-class"
        style={{ color: 'red' }}
        data-testid="wrapper"
      >
        <span>child</span>
      </ScopedPlatform>,
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toHaveClass('custom-class');
    expect(wrapper.style.color).toBe('red');
  });
});
