/**
 * Checkbox.test.tsx
 * Unit and accessibility tests
 */

import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with children label', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders with label prop', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('prefers label prop over children', () => {
    render(<Checkbox label="From prop">From children</Checkbox>);
    expect(screen.getByRole('checkbox', { name: 'From prop' })).toBeInTheDocument();
    expect(screen.queryByText('From children')).not.toBeInTheDocument();
  });

  it('renders description below label and links aria-describedby', () => {
    render(<Checkbox label="Subscribe" description="Weekly digest only." />);
    const checkbox = screen.getByRole('checkbox', { name: 'Subscribe' });
    expect(screen.getByText('Weekly digest only.')).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-describedby', expect.stringContaining('-description'));
  });

  it('renders description in label slot when label is omitted', () => {
    render(<Checkbox description="Weekly digest only." />);
    const checkbox = screen.getByRole('checkbox', { name: 'Weekly digest only.' });
    expect(checkbox).toHaveAttribute('aria-label', 'Weekly digest only.');
    expect(screen.getByText('Weekly digest only.')).toHaveAttribute(
      'id',
      expect.stringContaining('-description')
    );
  });

  it('renders without label', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('forwards data-testid to the checkbox control', () => {
    render(<Checkbox data-testid="qa-checkbox-root">Label</Checkbox>);
    const el = screen.getByTestId('qa-checkbox-root');
    expect(el).toHaveAttribute('role', 'checkbox');
  });

  it('calls onCheckedChange when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange}>Toggle</Checkbox>);

    await user.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange.mock.calls[0][0]).toBe(true);
  });

  it('supports controlled checked state', () => {
    const { rerender } = render(<Checkbox checked={false}>Controlled</Checkbox>);
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    rerender(<Checkbox checked>Controlled</Checkbox>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('supports default checked (uncontrolled)', () => {
    render(<Checkbox defaultChecked>Uncontrolled</Checkbox>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('supports indeterminate state', () => {
    render(<Checkbox indeterminate>Indeterminate</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-indeterminate');
  });

  it('disabled prevents interaction', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox disabled onCheckedChange={handleChange}>
        Disabled
      </Checkbox>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-disabled', 'true');

    await user.click(checkbox).catch(() => {});
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('readOnly prevents interaction', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Checkbox readOnly checked onCheckedChange={handleChange}>
        ReadOnly
      </Checkbox>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-readonly', 'true');
    expect(checkbox).toHaveAttribute('data-readonly', '');

    await user.click(checkbox).catch(() => {});
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('readOnly sets data-readonly on wrapper (visually distinct from disabled)', () => {
    const { container } = render(
      <Checkbox readOnly checked>
        ReadOnly
      </Checkbox>
    );
    const wrapper = container.querySelector('label');
    expect(wrapper).toHaveAttribute('data-readonly');
    expect(wrapper).not.toHaveAttribute('data-disabled');
  });

  it('uses the current surface color for the readOnly checked glyph', () => {
    const css = readFileSync(resolve(__dirname, 'Checkbox.module.css'), 'utf8');
    const ruleStart = css.indexOf('.checkbox[data-readonly][data-checked] .indicator,');
    const ruleEnd = css.indexOf('.checkbox[data-readonly][data-unchecked]', ruleStart);
    expect(ruleStart).toBeGreaterThanOrEqual(0);
    expect(ruleEnd).toBeGreaterThan(ruleStart);
    const readonlyIndicatorRule = css.slice(ruleStart, ruleEnd);

    expect(readonlyIndicatorRule).toContain('color: var(--Surface-Halo-Gap, var(--Surface-Main));');
    expect(readonlyIndicatorRule).not.toContain('Bold-TintedA11y');
  });

  it('forwards required to the native control', () => {
    const { container } = render(<Checkbox required>Required opt-in</Checkbox>);
    const input = container.querySelector('input[type="checkbox"]');
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute('required');
  });

  it('supports labelWrapper="div" for external Field.Label composition', () => {
    render(<Checkbox labelWrapper="div" aria-label="Standalone" />);
    const cb = screen.getByRole('checkbox', { name: 'Standalone' });
    expect(cb.closest('label')).toBeNull();
    expect(cb.closest('div')?.getAttribute('data-size')).toBe('m');
  });

  it('defaults to size m', () => {
    render(<Checkbox>Default</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-size', 'm');
  });

  it('resolves size s', () => {
    render(<Checkbox size="s">Small</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-size', 's');
  });

  it('resolves size l', () => {
    render(<Checkbox size="l">Large</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-size', 'l');
  });

  it('resolves legacy "small" to s', () => {
    render(<Checkbox size="small">Legacy</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-size', 's');
  });

  it('resolves legacy "medium" to m', () => {
    render(<Checkbox size="medium">Legacy</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-size', 'm');
  });

  it('resolves legacy "large" to l', () => {
    render(<Checkbox size="large">Legacy</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-size', 'l');
  });

  it('defaults appearance to secondary stack when unset (auto resolution)', () => {
    render(<Checkbox>Default</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-appearance', 'secondary');
    expect(checkbox).not.toHaveAttribute('data-accent');
  });

  it('resolves auto appearance to secondary', () => {
    render(<Checkbox appearance="auto">Auto</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-appearance', 'secondary');
    expect(checkbox).not.toHaveAttribute('data-accent');
  });

  it('applies appearance data attribute', () => {
    render(<Checkbox appearance="neutral">Neutral</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-appearance', 'neutral');
  });

  it('ignores deprecated accent prop at runtime', () => {
    render(
      <Checkbox appearance="neutral" accent="sparkle">
        No accent attr
      </Checkbox>
    );
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('data-accent');
  });

  it('renders hidden input with name and value', () => {
    const { container } = render(
      <Checkbox name="terms" value="accepted">
        Terms
      </Checkbox>
    );
    const hiddenInput = container.querySelector('input[type="hidden"], input[name="terms"]');
    expect(hiddenInput).toBeInTheDocument();
  });

  it('has proper role=checkbox', () => {
    render(<Checkbox>Accessible</Checkbox>);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('aria-checked reflects checked state', async () => {
    const user = userEvent.setup();
    render(<Checkbox>Toggle</Checkbox>);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('aria-disabled set when disabled', () => {
    render(<Checkbox disabled>Disabled</Checkbox>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-disabled', 'true');
  });
});
