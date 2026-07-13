import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type {
  ComponentRecipeDefinition,
  ComponentTokenManifest,
} from '@oneui/shared';
import { ComponentTokenEditorProvider } from '../ComponentTokenEditorContext';
import { EditorPanel } from './EditorPanel';

// Minimal CircularProgressIndicator surface: an SVG arc fill (indicatorColor),
// a track fill (trackColor) and the OPTIONAL centre-label colour (textColor).
const cpiManifest: ComponentTokenManifest = {
  componentName: 'CircularProgressIndicator',
  version: 'test',
  tokens: {
    indicatorColor: {
      category: 'color',
      subcategory: 'stroke',
      defaultToken: 'Primary-Bold',
      description: 'Arc',
    },
    trackColor: {
      category: 'color',
      subcategory: 'stroke',
      defaultToken: 'Primary-Subtle',
      description: 'Track',
    },
    textColor: {
      category: 'color',
      subcategory: 'text',
      defaultToken: 'Text-High',
      description: 'Centre label',
    },
  },
  totalTokens: 3,
  categories: { color: 3 },
};

// Mirrors the real recipe: a single centre-content decision (none/icon/text).
const cpiRecipe: ComponentRecipeDefinition = {
  componentName: 'CircularProgressIndicator',
  decisions: [
    {
      id: 'centerContent',
      label: 'Center content',
      rationale: 'What (if anything) renders inside the ring.',
      category: 'content',
      defaultOption: 'none',
      options: [
        { value: 'none', label: 'None', description: 'Empty center' },
        { value: 'icon', label: 'Icon', description: 'Render children as icon' },
        { value: 'text', label: 'Text', description: 'Auto percentage label' },
      ],
    },
  ],
  resolutionMap: {
    centerContent: { none: [], icon: [], text: [] },
  },
};

function renderPanel(centerContent: string) {
  return render(
    <ComponentTokenEditorProvider
      componentName="circularProgressIndicator"
      savedOverrides={[]}
      savedRecipeSelections={{ selections: { centerContent } }}
      savedComponentThemeSelections={[]}
      recipeDefinition={cpiRecipe}
    >
      <EditorPanel manifest={cpiManifest} recipeDefinition={cpiRecipe} />
    </ComponentTokenEditorProvider>
  );
}

describe('EditorPanel — CircularProgressIndicator centre-content text gating', () => {
  it('hides the Label (text) channel when centre content is none', () => {
    renderPanel('none');
    // Arc + track fills still render…
    expect(screen.getAllByText('Fill').length).toBeGreaterThan(0);
    // …but there is no centre content to recolour, so no text/label channel.
    expect(screen.queryByText('Label')).toBeNull();
  });

  it('shows the Label (text) channel when centre content is text', () => {
    renderPanel('text');
    expect(screen.getByText('Label')).toBeTruthy();
  });
});
