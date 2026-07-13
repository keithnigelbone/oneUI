/**
 * Input.test.tsx
 * Tests for the Input component family: Input (container), InputField, InputFeedback, InputDynamicText
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InputField } from '../InputField/InputField';
import { Input } from './Input';
import { InputFeedback, InputDynamicText } from './internals';

// ─── InputField (top-level aggregator) ────────────────────────────────────────

describe('InputField', () => {
  it('renders an input element', () => {
    render(<InputField placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<InputField label="Email" placeholder="you@example.com" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<InputField description="Enter your email" placeholder="Test" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('renders error message via InputFeedback', () => {
    render(<InputField error="This field is required" placeholder="Test" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders required asterisk on label', () => {
    render(<InputField label="Name" required placeholder="Test" />);
    const star = screen.getByText('*');
    expect(star).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders dynamic text row', () => {
    render(<InputField placeholder="Test" dynamicText="0/100 characters" />);
    expect(screen.getByText('0/100 characters')).toBeInTheDocument();
  });

  it('renders helper button string', () => {
    render(<InputField placeholder="Test" helperButton="Help" />);
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
  });

  it('renders custom feedback content', () => {
    render(
      <InputField
        placeholder="Test"
        feedback={<InputFeedback variant="informative" attention="medium">Custom info</InputFeedback>}
      />
    );
    expect(screen.getByText('Custom info')).toBeInTheDocument();
  });

  it('labelSlot overrides string label', () => {
    render(
      <InputField labelSlot={<span>From slot</span>} label="Ignored" placeholder="x" />,
    );
    expect(screen.getByText('From slot')).toBeInTheDocument();
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument();
  });

  it('dynamicTextSlot overrides dynamicText string', () => {
    render(
      <InputField
        label="L"
        placeholder="x"
        dynamicText="ignored"
        dynamicTextSlot={<InputDynamicText size="m" content="From slot" />}
      />,
    );
    expect(screen.getByText('From slot')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  // Size system
  it('renders data-size for default size 10 (M)', () => {
    const { container } = render(<InputField placeholder="Test" />);
    expect(container.querySelector('[data-size="10"]')).toBeInTheDocument();
  });

  it('resolves t-shirt alias "s" to 8', () => {
    const { container } = render(<InputField size="s" placeholder="Test" />);
    expect(container.querySelector('[data-size="8"]')).toBeInTheDocument();
  });

  it('resolves t-shirt alias "xs" to 6', () => {
    const { container } = render(<InputField size="xs" placeholder="Test" />);
    expect(container.querySelector('[data-size="6"]')).toBeInTheDocument();
  });

  it('resolves t-shirt alias "l" to 12', () => {
    const { container } = render(<InputField size="l" placeholder="Test" />);
    expect(container.querySelector('[data-size="12"]')).toBeInTheDocument();
  });

  // Appearance
  it('applies neutral appearance class', () => {
    const { container } = render(<InputField appearance="neutral" placeholder="Test" />);
    const containerEl = container.querySelector('[data-size]');
    expect(containerEl?.className).toContain('appearanceNeutral');
  });

  it('applies negative appearance class', () => {
    const { container } = render(<InputField appearance="negative" placeholder="Test" />);
    const containerEl = container.querySelector('[data-size]');
    expect(containerEl?.className).toContain('appearanceNegative');
  });

  // Slots
  it('renders start slot content', () => {
    render(<InputField start={<span data-testid="start-icon">S</span>} placeholder="Test" />);
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  it('renders all 4 slots', () => {
    render(
      <InputField
        start={<span data-testid="s1">1</span>}
        start2={<span data-testid="s2">2</span>}
        end={<span data-testid="e1">3</span>}
        end2={<span data-testid="e2">4</span>}
        placeholder="Test"
      />
    );
    expect(screen.getByTestId('s1')).toBeInTheDocument();
    expect(screen.getByTestId('s2')).toBeInTheDocument();
    expect(screen.getByTestId('e1')).toBeInTheDocument();
    expect(screen.getByTestId('e2')).toBeInTheDocument();
  });

  // Shape
  it('applies pill shape class', () => {
    const { container } = render(<InputField shape="pill" placeholder="Test" />);
    const containerEl = container.querySelector('[data-size]');
    expect(containerEl?.className).toContain('shapePill');
  });

  // States
  it('sets disabled state', () => {
    render(<InputField placeholder="Test" disabled />);
    expect(screen.getByPlaceholderText('Test')).toBeDisabled();
  });

  it('renders data-disabled on container', () => {
    const { container } = render(<InputField placeholder="Test" disabled />);
    expect(container.querySelector('[data-disabled]')).toBeInTheDocument();
  });

  it('sets readOnly', () => {
    render(<InputField defaultValue="Read only" readOnly />);
    expect(screen.getByDisplayValue('Read only')).toHaveAttribute('readonly');
  });

  it('renders data-invalid when error provided', () => {
    const { container } = render(<InputField placeholder="Test" error="Error" />);
    expect(container.querySelector('[data-invalid]')).toBeInTheDocument();
  });

  it('renders default info control when infoIcon is true', () => {
    render(<InputField label="Field" infoIcon placeholder="x" />);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });

  // Interaction
  it('calls onChange with input value', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<InputField placeholder="Test" onChange={handleChange} />);
    await user.type(screen.getByPlaceholderText('Test'), 'hi');
    expect(handleChange).toHaveBeenCalledWith('h');
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('calls onBlur when focus leaves', async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<InputField placeholder="Test" onBlur={handleBlur} />);
    await user.click(screen.getByPlaceholderText('Test'));
    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  // Ref
  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<InputField ref={ref} placeholder="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  // HTML attributes
  it('passes type attribute', () => {
    render(<InputField type="email" placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toHaveAttribute('type', 'email');
  });

  it('passes id attribute', () => {
    render(<InputField id="my-input" placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toHaveAttribute('id', 'my-input');
  });

});

// ─── Input (standalone container) ─────────────────────────────────────────────

describe('Input (container)', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Standalone" />);
    expect(screen.getByPlaceholderText('Standalone')).toBeInTheDocument();
  });

  it('forwards maxLength to the native input', () => {
    render(<Input placeholder="Limited" maxLength={12} />);
    expect(screen.getByPlaceholderText('Limited')).toHaveAttribute('maxlength', '12');
  });

  it('renders with slots', () => {
    render(
      <Input
        start={<span data-testid="s">S</span>}
        end={<span data-testid="e">E</span>}
        placeholder="Slotted"
      />
    );
    expect(screen.getByTestId('s')).toBeInTheDocument();
    expect(screen.getByTestId('e')).toBeInTheDocument();
  });

  it('applies appearance class', () => {
    const { container } = render(<Input appearance="sparkle" placeholder="Test" />);
    const el = container.querySelector('[data-size]');
    expect(el?.className).toContain('appearanceSparkle');
  });

  it('applies pill shape', () => {
    const { container } = render(<Input shape="pill" placeholder="Test" />);
    const el = container.querySelector('[data-size]');
    expect(el?.className).toContain('shapePill');
  });

  it('applies readOnly class', () => {
    const { container } = render(<Input readOnly placeholder="Test" />);
    const el = container.querySelector('[data-size]');
    expect(el?.className).toContain('readOnly');
  });

  it('applies aria-label to the input element', () => {
    render(<Input aria-label="Search products" placeholder="Search…" />);
    expect(screen.getByLabelText('Search products')).toBeInTheDocument();
  });

  it('applies errorHighlight on bordered container', () => {
    const { container } = render(<Input placeholder="Test" errorHighlight />);
    expect(container.querySelector('[data-invalid]')).toBeInTheDocument();
  });
});

// ─── InputFeedback ────────────────────────────────────────────────────────────

describe('InputFeedback', () => {
  it('renders feedback message', () => {
    render(<InputFeedback variant="negative">Error occurred</InputFeedback>);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('renders with role="alert"', () => {
    render(<InputFeedback variant="negative">Error</InputFeedback>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('non-negative defaults to role status', () => {
    render(<InputFeedback variant="positive">Saved</InputFeedback>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders icon slot for each variant', () => {
    const { container: c1 } = render(<InputFeedback variant="negative">Neg</InputFeedback>);
    const { container: c2 } = render(<InputFeedback variant="positive">Pos</InputFeedback>);
    const { container: c3 } = render(<InputFeedback variant="warning">Warn</InputFeedback>);
    const { container: c4 } = render(<InputFeedback variant="informative">Info</InputFeedback>);
    expect(c1.querySelector('[data-appearance="negative"]')).toBeInTheDocument();
    expect(c2.querySelector('[data-appearance="positive"]')).toBeInTheDocument();
    expect(c3.querySelector('[data-appearance="warning"]')).toBeInTheDocument();
    expect(c4.querySelector('[data-appearance="informative"]')).toBeInTheDocument();
  });

  it('applies attention classes', () => {
    const { container: c1 } = render(<InputFeedback attention="low">Low</InputFeedback>);
    const { container: c2 } = render(<InputFeedback attention="medium">Med</InputFeedback>);
    const { container: c3 } = render(<InputFeedback attention="high">High</InputFeedback>);
    expect(c1.firstElementChild?.className).toContain('attentionLow');
    expect(c2.firstElementChild?.className).toContain('attentionMedium');
    expect(c3.firstElementChild?.className).toContain('attentionHigh');
  });

  it('applies variant classes', () => {
    const { container } = render(<InputFeedback variant="positive">OK</InputFeedback>);
    expect(container.firstElementChild?.className).toContain('variantPositive');
  });

  it('renders data-size', () => {
    const { container } = render(<InputFeedback size={12}>Big</InputFeedback>);
    expect(container.querySelector('[data-size="12"]')).toBeInTheDocument();
  });

  it('uses feedback_message when set (Figma API)', () => {
    render(
      <InputFeedback variant="negative" feedback_message="From prop">
        Ignored children
      </InputFeedback>,
    );
    expect(screen.getByText('From prop')).toBeInTheDocument();
    expect(screen.queryByText('Ignored children')).not.toBeInTheDocument();
  });

  it('returns null when there is no message', () => {
    const { container } = render(<InputFeedback variant="negative" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with customIcon', () => {
    const { container } = render(
      <InputFeedback variant="informative" attention="low" feedback_message="Help copy" customIcon="help" />,
    );
    expect(screen.getByText('Help copy')).toBeInTheDocument();
    expect(container.querySelector('[data-appearance="informative"]')).toBeInTheDocument();
  });
});

// ─── InputDynamicText ───────────────────────────────────────────────────────────

describe('InputDynamicText', () => {
  it('renders content string', () => {
    render(<InputDynamicText content="0 / 100" />);
    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('renders end as an accessible Button', () => {
    render(<InputDynamicText content="Count" end="Helper Button" />);
    expect(screen.getByRole('button', { name: 'Helper Button' })).toBeInTheDocument();
  });

  it('returns null when no props', () => {
    const { container } = render(<InputDynamicText />);
    expect(container.firstChild).toBeNull();
  });
});
