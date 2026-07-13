import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type {
  ComponentRecipeDefinition,
  ComponentTokenManifest,
} from '@oneui/shared';
import {
  ComponentTokenEditorProvider,
} from '../ComponentTokenEditorContext';
import { ComponentThemePanel } from './ComponentThemePanel';
import { EditorPanelRouter } from './EditorPanelRouter';

const manifest: ComponentTokenManifest = {
  componentName: 'Button',
  version: 'test',
  tokens: {
    backgroundColor: {
      category: 'color',
      subcategory: 'surface',
      defaultToken: 'Primary-Bold',
      description: 'Button background',
    },
    fontSize: {
      category: 'typography',
      subcategory: 'size',
      defaultToken: 'Label-M-FontSize',
      description: 'Button label size',
    },
    letterSpacing: {
      category: 'typography',
      subcategory: 'letterSpacing',
      defaultToken: 'normal',
      description: 'Button label spacing',
    },
    transitionDuration: {
      category: 'motion',
      subcategory: 'duration',
      defaultToken: 'Motion-Duration-M',
      description: 'Transition duration',
    },
  },
  totalTokens: 4,
  categories: {
    color: 1,
    typography: 2,
    motion: 1,
  },
};

const recipeDefinition: ComponentRecipeDefinition = {
  componentName: 'Button',
  decisions: [
    {
      id: 'textTransform',
      label: 'Text case',
      rationale: 'Controls label casing.',
      category: 'typography',
      defaultOption: 'none',
      options: [
        { value: 'none', label: 'Aa', description: 'Preserve casing.' },
        { value: 'uppercase', label: 'AA', description: 'Uppercase labels.' },
      ],
    },
  ],
  resolutionMap: {
    textTransform: {
      none: [],
      uppercase: [
        { tokenName: 'textTransform', value: 'uppercase' },
      ],
    },
  },
};

function renderWithEditorProvider(ui: React.ReactElement) {
  return render(
    <ComponentTokenEditorProvider
      componentName="button"
      savedOverrides={[]}
      savedRecipeSelections={{ selections: {} }}
      savedComponentThemeSelections={[]}
      recipeDefinition={recipeDefinition}
    >
      {ui}
    </ComponentTokenEditorProvider>
  );
}

describe('EditorPanelRouter component overrides route', () => {
  it('renders local recipe controls inside the merged component overrides panel', () => {
    renderWithEditorProvider(
      <EditorPanelRouter
        componentName="button"
        manifest={manifest}
        panelMode="overrides"
        recipeDefinition={recipeDefinition}
        onResetAll={() => {}}
        onExportCSS={() => {}}
      />
    );

    expect(screen.getByText('Component Overrides')).toBeTruthy();
    expect(screen.getByText('Component recipe')).toBeTruthy();
    expect(screen.queryByText('Global Component Theme')).toBeNull();
    expect(screen.getByText('Text case')).toBeTruthy();
    expect(screen.getByText('Typography')).toBeTruthy();
    expect(screen.queryByText('Color')).toBeNull();
  });

  it('keeps the global component theme panel available outside the local route', () => {
    renderWithEditorProvider(<ComponentThemePanel componentName="button" />);

    expect(screen.getByText('Global Component Theme')).toBeTruthy();
    expect(screen.getByText('Apply family decisions across related components first, then refine individual components only when needed.')).toBeTruthy();
  });
});
