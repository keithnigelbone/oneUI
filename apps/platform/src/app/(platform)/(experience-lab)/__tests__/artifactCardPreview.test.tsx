// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { CompositionSpecT } from '@oneui/experience-builder-core';

vi.mock('@oneui/ui/components/Surface', () => ({
  Surface: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@oneui/ui/components/Badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

vi.mock('@oneui/ui/components/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@oneui/ui/components/IconButton', () => ({
  IconButton: (props: any) => <button {...props} />,
}));

vi.mock('@oneui/ui/components/Menu', () => {
  const Menu = ({ children }: any) => <div>{children}</div>;
  Menu.Trigger = ({ render }: any) => <>{render}</>;
  Menu.Portal = ({ children }: any) => <div>{children}</div>;
  Menu.Group = ({ children }: any) => <div>{children}</div>;
  Menu.Item = ({ children, ...props }: any) => <button {...props}>{children}</button>;
  Menu.Separator = () => <hr />;
  return { Menu };
});

vi.mock('@oneui/ui/components/ToggleGroup', () => {
  const ToggleGroup = ({ children }: any) => <div>{children}</div>;
  ToggleGroup.Item = ({ children }: any) => <button>{children}</button>;
  return { ToggleGroup };
});

vi.mock('../_canvas/SpecRenderer', () => ({
  SpecRenderer: () => <div data-testid="composition-spec-renderer" />,
}));

import { PreviewRegion } from '../_canvas/shapes/ArtifactCardShape';

describe('artifact card composition preview', () => {
  it('renders the same-tree composition preview before falling back to a live iframe', () => {
    const compositionSpec: CompositionSpecT = {
      version: '1',
      name: 'same tree preview',
      artifactType: 'web-ui',
      targetProfile: 'web-desktop',
      brandId: 'jio',
      root: {
        id: 'composition-root',
        component: 'Container',
        slots: { children: 'Same-tree preview' },
      },
    };

    render(
      <PreviewRegion
        lifecycle="live"
        previewUrl="https://preview.example/r?t=opaque-token"
        previewSameOrigin={false}
        thumbnailUrl=""
        shapeId="shape:artifact-spec"
        compositionSpec={compositionSpec}
      />,
    );

    expect(screen.getByTestId('composition-spec-renderer')).toBeTruthy();
    expect(screen.queryByTestId('artifact-preview-iframe-shape:artifact-spec')).toBeNull();
  });
});
