import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ASTRoot } from '@oneui/shared';
import { ASTRenderer } from './ASTRenderer';
import { IconProvider } from '../icons/IconContext';

vi.mock('hugeicons-react', () => ({}));

afterEach(() => {
  vi.restoreAllMocks();
});

function renderAST(tree: ASTRoot) {
  return render(
    <IconProvider iconSet="lucide" defaultSize="md">
      <ASTRenderer tree={tree} mode="render" />
    </IconProvider>,
  );
}

describe('ASTRenderer prop normalization', () => {
  it('normalizes legacy Icon.name to the design-system icon prop without dropping it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderAST({
      version: 1,
      name: 'icon-normalization',
      root: {
        id: 'icon-1',
        kind: 'component',
        type: 'Icon',
        props: { name: 'add', 'aria-label': 'Add icon' },
        children: [],
      },
    });

    expect(screen.getByRole('img', { name: 'Add icon' })).toBeTruthy();
    expect(warn.mock.calls.flat().join('\n')).not.toContain('dropped non-allowed props');
  });

  it('replaces generated CSS-token icon names with a valid semantic fallback', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderAST({
      version: 1,
      name: 'icon-token-normalization',
      root: {
        id: 'icon-1',
        kind: 'component',
        type: 'Icon',
        props: { icon: 'var(--Typography-Font-Primary)', 'aria-label': 'Generated icon' },
        children: [],
      },
    });

    expect(screen.getByRole('img', { name: 'Generated icon' })).toBeTruthy();
    expect(warn.mock.calls.flat().join('\n')).not.toContain('not found in semantic mappings');
  });

  it('keeps valid semantic Icon.icon values intact', () => {
    renderAST({
      version: 1,
      name: 'icon-valid-normalization',
      root: {
        id: 'icon-1',
        kind: 'component',
        type: 'Icon',
        props: { icon: 'star', 'aria-label': 'Star icon' },
        children: [],
      },
    });

    expect(screen.getByRole('img', { name: 'Star icon' })).toBeTruthy();
  });

  it('keeps surfaceMode off DOM nodes and routes it through a Surface wrapper', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderAST({
      version: 1,
      name: 'surface-mode-normalization',
      root: {
        id: 'section-1',
        kind: 'element',
        tag: 'section',
        props: { surfaceMode: 'bold' },
        children: [{ id: 'text-1', kind: 'text', text: 'Readable surface' }],
      },
    });

    expect(container.querySelector('[data-surface="bold"]')).toBeTruthy();
    expect(container.querySelector('[surfacemode]')).toBeNull();
    expect(error.mock.calls.flat().join('\n')).not.toContain('surfaceMode');
  });

  it('adds an aria label to generated empty badges', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderAST({
      version: 1,
      name: 'badge-a11y-normalization',
      root: {
        id: 'badge-1',
        kind: 'component',
        type: 'Badge',
        props: { size: 's', appearance: 'positive' },
        children: [],
      },
    });

    expect(screen.getByRole('status', { name: 'Status badge' })).toBeTruthy();
    expect(warn.mock.calls.flat().join('\n')).not.toContain('aria-label');
  });

  it('uses on-bold text tokens for generated text aliases inside bold surfaces', () => {
    const { container } = renderAST({
      version: 1,
      name: 'bold-text-tokens',
      root: {
        id: 'section-1',
        kind: 'component',
        type: 'Container',
        props: { surfaceMode: 'bold' },
        children: [
          {
            id: 'heading-1',
            kind: 'component',
            type: 'Heading',
            props: { variant: 'headline', size: 'l' },
            children: [{ id: 'copy-1', kind: 'text', text: 'Readable on bold' }],
          },
        ],
      },
    });

    const heading = container.querySelector('[data-ir-node-id="heading-1"]') as HTMLElement;
    expect(heading.style.color).toContain('--Text-OnBold-High');
    expect(heading.style.color).not.toContain('--Primary-Default');
  });
});
