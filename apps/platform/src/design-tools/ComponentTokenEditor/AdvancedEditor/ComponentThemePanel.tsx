'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ATTENTION_ROLE_DECISION_IDS,
  ATTENTION_STYLE_DECISION_IDS,
  AVAILABLE_TOKENS,
  COMPONENT_THEME_FAMILIES,
  getComponentThemeFamiliesForComponent,
  isThemeParamKey,
  themeParamKey,
  type ComponentThemeFamilyId,
} from '@oneui/shared';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { ToggleGroup } from '@oneui/ui-internal/components/ToggleGroup/ToggleGroup';
import {
  useComponentTokenEditor,
  generateTokenOptionsFromFoundation,
} from '../ComponentTokenEditorContext';
import { AttentionMatrix } from './AttentionMatrix';
import { FamilyMetricsMatrix } from './FamilyMetricsMatrix';
import { RecipeDecisionGroup } from './RecipeDecisionGroup';
import styles from './RecipePanel.module.css';

/** Decision ids rendered by the AttentionMatrix instead of generic radios. */
const ATTENTION_DECISION_IDS = new Set<string>([
  ...Object.values(ATTENTION_STYLE_DECISION_IDS),
  ...Object.values(ATTENTION_ROLE_DECISION_IDS),
]);

/** Scale-ish decision ids that support the `custom` ramp/cell matrix. */
const SCALE_DECISION_IDS = new Set(['controlScale', 'density']);

export interface ComponentThemePanelProps {
  /** Current component name, used to highlight the family that affects it. */
  componentName: string;
  /** Decisions controlled elsewhere in the current workflow. */
  hiddenDecisionIds?: string[];
}

function familyHasOverrides(
  family: (typeof COMPONENT_THEME_FAMILIES)[number],
  selections: Record<string, string>,
): boolean {
  return (
    family.decisions.some(
      (decision) =>
        selections[decision.id] !== undefined
        && selections[decision.id] !== decision.defaultOption
    )
    // Precision params (`shapeLanguage:token`, `controlScale:cell:*`) are
    // overrides even when the decision key itself is missing.
    || Object.keys(selections).some((key) => isThemeParamKey(key))
  );
}

export function ComponentThemePanel({
  componentName,
  hiddenDecisionIds = [],
}: ComponentThemePanelProps) {
  const affectedFamily = useMemo(
    () => getComponentThemeFamiliesForComponent(componentName)[0],
    [componentName]
  );
  const [selectedFamilyId, setSelectedFamilyId] = useState<ComponentThemeFamilyId>(
    affectedFamily?.id ?? COMPONENT_THEME_FAMILIES[0].id
  );
  useEffect(() => {
    if (affectedFamily) {
      setSelectedFamilyId(affectedFamily.id);
    }
  }, [affectedFamily]);
  const {
    componentThemeSelections,
    foundationData,
    resetAllComponentThemes,
    resetComponentThemeFamily,
    setComponentThemeDecision,
    setComponentThemeDecisionParam,
  } = useComponentTokenEditor();

  const selectedFamily =
    COMPONENT_THEME_FAMILIES.find((family) => family.id === selectedFamilyId)
    ?? COMPONENT_THEME_FAMILIES[0];
  const selections = componentThemeSelections[selectedFamily.id] ?? {};
  const visibleDecisions = selectedFamily.decisions.filter(
    (decision) =>
      !hiddenDecisionIds.includes(decision.id) && !ATTENTION_DECISION_IDS.has(decision.id)
  );
  const attentionDecisions = useMemo(
    () =>
      new Map(
        selectedFamily.decisions
          .filter((decision) => ATTENTION_DECISION_IDS.has(decision.id))
          .map((decision) => [decision.id, decision])
      ),
    [selectedFamily]
  );
  const selectedFamilyHasOverrides = familyHasOverrides(selectedFamily, selections);
  const anyFamilyHasOverrides = COMPONENT_THEME_FAMILIES.some((family) =>
    familyHasOverrides(family, componentThemeSelections[family.id] ?? {})
  );

  const shapeTokenOptions = useMemo(() => {
    const dynamic = generateTokenOptionsFromFoundation(foundationData, 'shape');
    const available = dynamic.length > 0 ? dynamic : AVAILABLE_TOKENS.shape;
    return available.map((option) => ({ value: option.token, label: option.label }));
  }, [foundationData]);

  return (
    <div className={styles.panel}>
      <ToggleGroup
        value={[selectedFamily.id]}
        onValueChange={(values) => {
          const next = Array.isArray(values) ? values[0] : values;
          if (next) setSelectedFamilyId(next as ComponentThemeFamilyId);
        }}
        size="compact"
        fullWidth
      >
        {COMPONENT_THEME_FAMILIES.map((family) => (
          <ToggleGroup.Item
            key={family.id}
            value={family.id}
            aria-label={family.label}
          >
            {family.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      <div className={styles.familyHeader}>
        <span className={styles.familyTitle}>Global Component Theme</span>
        <span className={styles.familyDescription}>
          Apply family decisions across related components first, then refine individual components only when needed.
        </span>
      </div>

      <div className={styles.familySummary}>
        <span className={styles.familyTitle}>{selectedFamily.label}</span>
        <span className={styles.familyDescription}>{selectedFamily.description}</span>
      </div>

      <div className={styles.decisions}>
        {visibleDecisions.map((decision) => {
          const selectedValue = selections[decision.id] || decision.defaultOption;
          return (
            <React.Fragment key={decision.id}>
              <RecipeDecisionGroup
                decision={decision}
                selectedValue={selectedValue}
                onChange={(value) =>
                  setComponentThemeDecision(selectedFamily.id, decision.id, value)
                }
              />
              {decision.id === 'shapeLanguage' && selectedValue === 'custom' && (() => {
                const storedShapeToken =
                  selections[themeParamKey('shapeLanguage', 'token')] ?? '';
                // A value persisted before the token list changed (e.g. an old
                // T-shirt name) may not be in the current options. Surface it as
                // an explicit "unavailable" entry so the Select shows what was
                // saved instead of rendering blank, and the user can re-pick.
                const shapeOptions =
                  storedShapeToken &&
                  !shapeTokenOptions.some((option) => option.value === storedShapeToken)
                    ? [
                        ...shapeTokenOptions,
                        { value: storedShapeToken, label: `${storedShapeToken} (unavailable)` },
                      ]
                    : shapeTokenOptions;
                return (
                  <Select
                    value={storedShapeToken}
                    onChange={(value) =>
                      setComponentThemeDecisionParam(
                        selectedFamily.id,
                        themeParamKey('shapeLanguage', 'token'),
                        value
                      )
                    }
                    options={shapeOptions}
                    placeholder="Pick a Shape token"
                    size="sm"
                    aria-label="Custom shape token"
                  />
                );
              })()}
              {SCALE_DECISION_IDS.has(decision.id) && selectedValue === 'custom' && (
                <FamilyMetricsMatrix
                  family={selectedFamily}
                  scaleDecisionId={decision.id}
                  selections={selections}
                  onParam={(paramKey, value) =>
                    setComponentThemeDecisionParam(selectedFamily.id, paramKey, value)
                  }
                />
              )}
            </React.Fragment>
          );
        })}
        {attentionDecisions.size > 0 && (
          <AttentionMatrix
            decisionsById={attentionDecisions}
            selections={selections}
            onDecision={(decisionId, value) =>
              setComponentThemeDecision(selectedFamily.id, decisionId, value)
            }
          />
        )}
      </div>

      <div className={styles.resetCard}>
        <span className={styles.familyTitle}>Reset global theme</span>
        <span className={styles.familyDescription}>
          Reset only the selected family, or clear all family-level component theme decisions for this brand. Reset removes the stored decisions entirely, returning components to their factory definitions.
        </span>
        <div className={styles.statusActions}>
          <Button
            attention="low"
            size="s"
            onPress={() => resetComponentThemeFamily(selectedFamily.id)}
            disabled={!selectedFamilyHasOverrides}
          >
            Reset {selectedFamily.label}
          </Button>
          <Button
            attention="medium"
            size="s"
            onPress={resetAllComponentThemes}
            disabled={!anyFamilyHasOverrides}
          >
            Reset Global Theme
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ComponentThemePanel;
