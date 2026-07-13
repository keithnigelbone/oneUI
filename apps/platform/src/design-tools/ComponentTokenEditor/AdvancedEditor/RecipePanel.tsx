/**
 * RecipePanel.tsx
 *
 * Container for recipe design decisions.
 * Renders compact, visual decision controls.
 */

'use client';

import React from 'react';
import {
  getFamilyOwnedRecipeDecisionIds,
  type ComponentRecipeDefinition,
} from '@oneui/shared';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { RecipeDecisionGroup } from './RecipeDecisionGroup';
import styles from './RecipePanel.module.css';

export interface RecipePanelProps {
  /** Recipe definition for the component */
  definition: ComponentRecipeDefinition;
}

export function RecipePanel({ definition }: RecipePanelProps) {
  const {
    draftOverrides,
    recipeSelections,
    recipeOwnedKeys,
    resetAllOverrides,
    setRecipeDecision,
  } = useComponentTokenEditor();
  const hiddenDecisionIds = getFamilyOwnedRecipeDecisionIds(definition.componentName);
  const visibleDecisions = definition.decisions.filter(
    (decision) => !hiddenDecisionIds.has(decision.id)
  );
  const overriddenDecisions = definition.decisions.filter((decision) => {
    const selected = recipeSelections[decision.id];
    return selected !== undefined && selected !== decision.defaultOption;
  });
  const visibleOverriddenDecisions = overriddenDecisions.filter(
    (decision) => !hiddenDecisionIds.has(decision.id)
  );
  const overriddenVisibleDecisionIds = new Set(
    visibleOverriddenDecisions.map((decision) => decision.id)
  );
  const hiddenOverrideLabels = overriddenDecisions
    .filter((decision) => hiddenDecisionIds.has(decision.id))
    .map((decision) => decision.label);
  const advancedOverrideCount = Array.from(draftOverrides.keys()).filter(
    (key) => !recipeOwnedKeys.has(key)
  ).length;
  const hasVisibleRecipeOverride = visibleOverriddenDecisions.length > 0;
  const hasHiddenRecipeOverride = hiddenOverrideLabels.length > 0;
  const hasComponentOverride = hasVisibleRecipeOverride || hasHiddenRecipeOverride;
  const hasAnyLocalOverride = hasComponentOverride || advancedOverrideCount > 0;
  const overviewText = [
    hasVisibleRecipeOverride
      ? `${visibleOverriddenDecisions.length} refinement ${visibleOverriddenDecisions.length === 1 ? 'choice' : 'choices'}`
      : null,
    advancedOverrideCount > 0
      ? `${advancedOverrideCount} advanced token ${advancedOverrideCount === 1 ? 'override' : 'overrides'}`
      : null,
  ].filter(Boolean).join(' and ');

  return (
    <div className={styles.panel}>
      <div className={styles.familyHeader}>
        <span className={styles.titleWithIndicator}>
          <span className={styles.familyTitle}>Component Recipe</span>
          {hasAnyLocalOverride && (
            <span className={styles.overrideMarker} aria-label="Local overrides active" />
          )}
        </span>
        <span className={styles.familyDescription}>
          Curated per-component refinements. Leave these on inherit/default to follow the Global Component Theme.
        </span>
      </div>
      {hasAnyLocalOverride && (
        <div className={styles.overrideOverview} data-has-hidden={hiddenOverrideLabels.length > 0 || undefined}>
          <span className={styles.familyTitle}>Local overrides are active</span>
          <span className={styles.familyDescription}>
            {overviewText
              ? `${overviewText} currently override this component.`
              : 'Family-owned recipe choices are saved locally but ignored while controlled globally.'}
          </span>
          {hiddenOverrideLabels.length > 0 && (
            <span className={styles.familyDescription}>
              Hidden family-owned choices still set locally: {hiddenOverrideLabels.join(', ')}.
            </span>
          )}
          <div className={styles.statusActions}>
            {/* One reset that clears EVERYTHING this box counts — recipe
                decisions AND advanced token overrides. The box only renders when
                hasAnyLocalOverride, so this is always actionable (no dead/disabled
                state when only advanced colour/material overrides exist). */}
            <Button
              attention="low"
              size="s"
              onPress={resetAllOverrides}
            >
              Reset all
            </Button>
          </div>
        </div>
      )}
      <div className={styles.decisions}>
        {visibleDecisions.map((decision) => (
          <RecipeDecisionGroup
            key={decision.id}
            decision={decision}
            selectedValue={recipeSelections[decision.id] || decision.defaultOption}
            isOverridden={overriddenVisibleDecisionIds.has(decision.id)}
            onChange={(value) => setRecipeDecision(decision.id, value)}
          />
        ))}
      </div>
    </div>
  );
}

export default RecipePanel;
