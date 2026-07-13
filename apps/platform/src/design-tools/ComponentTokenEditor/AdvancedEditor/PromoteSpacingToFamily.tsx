/**
 * PromoteSpacingToFamily.tsx
 *
 * Offers one-click promotion of local per-size spacing overrides to the
 * Global Component Theme when they form a UNIFORM Spacing-ladder shift of the
 * family's factory baseline. Promotion writes the family's `custom` scale
 * ramp and removes the local overrides, so every component in the family
 * follows the same decision.
 *
 * Non-uniform deltas are not promotable — family cells are shared across all
 * family targets, so a partial promotion would be ambiguous.
 */

'use client';

import React, { useMemo } from 'react';
import { ArrowUpToLine } from 'lucide-react';
import {
  getComponentThemeFamiliesForComponent,
  SPACING_LADDER,
  themeParamKey,
  type ComponentTokenManifest,
} from '@oneui/shared';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import styles from './PromoteSpacingToFamily.module.css';

const SCALE_DECISION_IDS = ['controlScale', 'density'];

interface PromotableMetric {
  metric: string;
  offset: number;
}

export interface PromoteSpacingToFamilyProps {
  manifest: ComponentTokenManifest;
}

export function PromoteSpacingToFamily({ manifest }: PromoteSpacingToFamilyProps) {
  const {
    draftOverrides,
    recipeOwnedKeys,
    setComponentThemeDecision,
    setComponentThemeDecisionParam,
    resetTokenOverride,
  } = useComponentTokenEditor();

  const componentName = manifest.componentName;

  const familyContext = useMemo(() => {
    for (const family of getComponentThemeFamiliesForComponent(componentName)) {
      const target = family.targets.find(
        (candidate) => candidate.componentName === componentName && candidate.metricBaselines,
      );
      const scaleDecision = family.decisions.find((decision) =>
        SCALE_DECISION_IDS.includes(decision.id),
      );
      if (target && scaleDecision) return { family, target, scaleDecision };
    }
    return null;
  }, [componentName]);

  const promotable = useMemo<PromotableMetric[]>(() => {
    if (!familyContext) return [];
    const ladderIndex = new Map(SPACING_LADDER.map((token, index) => [token, index]));
    const results: PromotableMetric[] = [];

    for (const [metric, sizes] of Object.entries(familyContext.target.metricBaselines!)) {
      let uniformOffset: number | null = null;
      let promotable = true;

      for (const [size, baseline] of Object.entries(sizes)) {
        const key = size === '' ? metric : `${metric}.${size}`;
        const draft = draftOverrides.get(key);
        // Only MANUAL overrides promote; recipe-authored entries stay local.
        if (!draft || recipeOwnedKeys.has(key)) {
          promotable = false;
          break;
        }
        const baseIndex = ladderIndex.get(baseline);
        const valueIndex = ladderIndex.get(draft.selectedToken);
        if (baseIndex === undefined || valueIndex === undefined) {
          promotable = false;
          break;
        }
        const offset = valueIndex - baseIndex;
        if (uniformOffset === null) uniformOffset = offset;
        else if (offset !== uniformOffset) {
          promotable = false;
          break;
        }
      }

      if (promotable && uniformOffset !== null && uniformOffset !== 0) {
        results.push({ metric, offset: uniformOffset });
      }
    }
    return results;
  }, [familyContext, draftOverrides, recipeOwnedKeys]);

  if (!familyContext || promotable.length === 0) return null;

  const { family, scaleDecision } = familyContext;

  const handlePromote = () => {
    setComponentThemeDecision(family.id, scaleDecision.id, 'custom');
    for (const { metric, offset } of promotable) {
      setComponentThemeDecisionParam(
        family.id,
        themeParamKey(scaleDecision.id, `ramp:${metric}`),
        String(offset),
      );
      resetTokenOverride(metric);
    }
  };

  return (
    <div className={styles.promote}>
      <span className={styles.promoteText}>
        {promotable.map(({ metric, offset }) => `${metric} ${offset > 0 ? '+' : ''}${offset}`).join(', ')}{' '}
        matches a uniform spacing-ladder shift — apply it to every {family.label} component?
      </span>
      <Button
        attention="medium"
        size="s"
        start={<ArrowUpToLine size={12} />}
        onPress={handlePromote}
      >
        Promote to family
      </Button>
    </div>
  );
}

export default PromoteSpacingToFamily;
