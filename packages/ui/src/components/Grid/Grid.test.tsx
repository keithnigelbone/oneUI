import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Grid } from './Grid';
import { Column } from './Column';
import { Container } from '../Container';
import { responsiveToCSSVars } from './responsive';

describe('responsiveToCSSVars', () => {
  it('returns a single fallback var for number values', () => {
    expect(responsiveToCSSVars(6, '--col-span')).toEqual({ '--col-span': '6' });
  });

  it('returns per-breakpoint vars for object values', () => {
    expect(responsiveToCSSVars({ S: 4, M: 4, L: 6 }, '--col-span')).toEqual({
      '--col-span-s': '4',
      '--col-span-m': '4',
      '--col-span-l': '6',
    });
  });

  it('ignores omitted breakpoints', () => {
    expect(responsiveToCSSVars({ L: 8 }, '--col-span')).toEqual({ '--col-span-l': '8' });
  });

  it('returns empty object for undefined', () => {
    expect(responsiveToCSSVars(undefined, '--col-span')).toEqual({});
  });
});

describe('Grid', () => {
  it('renders children inside a grid container', () => {
    const { container } = render(
      <Grid>
        <Column>A</Column>
        <Column>B</Column>
      </Grid>,
    );
    expect(container.querySelectorAll('div').length).toBeGreaterThanOrEqual(3);
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
  });

  it('writes --grid-columns inline var when columns prop is a number', () => {
    const { container } = render(<Grid columns={6} data-testid="g" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--grid-columns')).toBe('6');
  });

  it('writes per-breakpoint vars when columns is an object', () => {
    const { container } = render(<Grid columns={{ S: 4, L: 12 }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--grid-columns-s')).toBe('4');
    expect(el.style.getPropertyValue('--grid-columns-l')).toBe('12');
  });
});

describe('Column', () => {
  it('writes --col-span for a numeric span', () => {
    const { container } = render(<Column span={6} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--col-span')).toBe('6');
  });

  it('writes per-breakpoint --col-span-* for a responsive span', () => {
    const { container } = render(<Column span={{ S: 4, M: 4, L: 8 }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--col-span-s')).toBe('4');
    expect(el.style.getPropertyValue('--col-span-m')).toBe('4');
    expect(el.style.getPropertyValue('--col-span-l')).toBe('8');
  });

  it('supports a custom element via `as`', () => {
    const { container } = render(
      <Column as="section" data-testid="col">
        x
      </Column>,
    );
    expect(container.firstElementChild?.tagName).toBe('SECTION');
  });
});

describe('Container', () => {
  it('applies the fluid variant class by default', () => {
    const { container } = render(<Container>content</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/fluid/);
  });

  it('applies the fixed variant class when requested', () => {
    const { container } = render(<Container variant="fixed">content</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/fixed/);
  });

  it('applies the full-bleed variant class when requested', () => {
    const { container } = render(<Container variant="full-bleed">content</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/full-bleed/);
  });

  it('threads a custom maxWidth into an inline CSS var (fixed only consumer)', () => {
    const { container } = render(
      <Container variant="fixed" maxWidth="1200px">
        content
      </Container>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--_container-max-width')).toBe('1200px');
  });
});
