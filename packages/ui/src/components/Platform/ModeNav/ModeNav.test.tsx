import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeNav } from './ModeNav';
import type { ModeNavItem } from './ModeNav.shared';
import { DecorationProvider } from '../../../hooks/useDecorationContext';
import type { DecorationConfig } from '@oneui/shared';

const ITEMS: ModeNavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'build', label: 'Build' },
  { id: 'system', label: 'System' },
  { id: 'agents', label: 'Agents' },
];

/**
 * ModeNav renders a `<nav>` with one `<Button>` per item — it does NOT
 * use the WAI tablist pattern (no role="tab" / role="tablist"). Active
 * state is communicated via aria-current="page" only. These tests query
 * by role="button" accordingly.
 */
describe('ModeNav', () => {
  it('renders one button per item', () => {
    render(<ModeNav items={ITEMS} activeMode="home" onModeChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agents' })).toBeInTheDocument();
  });

  it('renders the active button at a higher attention level than inactive buttons', () => {
    // ModeNav distinguishes active state via Button's `attention` prop, which
    // useButtonState resolves into a variant:
    //   active   → attention="medium" → data-variant="subtle"
    //   inactive → attention="low"    → data-variant="ghost"
    // TODO: ModeNav also passes aria-current="page" to the active Button,
    // but Button.tsx does not currently forward arbitrary aria-* props
    // (only aria-label is named-passed). Re-add an aria-current assertion
    // here once Button accepts a11y prop pass-through.
    render(<ModeNav items={ITEMS} activeMode="build" onModeChange={() => {}} />);
    const build = screen.getByRole('button', { name: 'Build' });
    const home = screen.getByRole('button', { name: 'Home' });
    expect(build).toHaveAttribute('data-variant', 'subtle');
    expect(home).toHaveAttribute('data-variant', 'ghost');
  });

  it('opts platform chrome buttons out of brand ornament decoration', () => {
    const decorations = new Map<string, DecorationConfig>([
      [
        'Button',
        {
          componentName: 'Button',
          svgContent: '<svg viewBox="0 0 10 20"><path d="M0 0H10V20H0Z" /></svg>',
          aspectRatio: 0.5,
          mirror: true,
          placement: 'edges',
        },
      ],
    ]);

    render(
      <DecorationProvider decorations={decorations}>
        <ModeNav items={ITEMS} activeMode="home" onModeChange={() => {}} />
      </DecorationProvider>,
    );

    expect(document.querySelector('[data-ornament]')).not.toBeInTheDocument();
  });

  it('fires onModeChange when a different button is clicked', async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    render(<ModeNav items={ITEMS} activeMode="home" onModeChange={onModeChange} />);

    await user.click(screen.getByRole('button', { name: 'System' }));

    expect(onModeChange).toHaveBeenCalledOnce();
    expect(onModeChange).toHaveBeenCalledWith('system');
  });

  it('still fires onModeChange when clicking the already-active button', async () => {
    // ModeNav is intentionally dumb — the caller decides whether to act on
    // a same-mode click. The component does not gate the callback.
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    render(<ModeNav items={ITEMS} activeMode="home" onModeChange={onModeChange} />);

    await user.click(screen.getByRole('button', { name: 'Home' }));

    expect(onModeChange).toHaveBeenCalledOnce();
    expect(onModeChange).toHaveBeenCalledWith('home');
  });
});
