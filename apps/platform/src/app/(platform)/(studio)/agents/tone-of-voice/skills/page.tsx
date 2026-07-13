/**
 * agents/voice/skills/page.tsx
 *
 * Voice Skills — uses FoundationCard per skill, matching overview page style.
 */

'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { Switch } from '@oneui/ui/components/Switch';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../voice.module.css';

export default function VoiceSkillsPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const skills = useQuery(api.voiceSkills.list, brandId ? { brandId } : 'skip');
  const seedDefaults = useMutation(api.voiceSkills.seedDefaults);
  const toggleActive = useMutation(api.voiceSkills.toggleActive);

  const handleSeed = useCallback(async () => {
    if (!brandId) return;
    await seedDefaults({ brandId });
  }, [brandId, seedDefaults]);

  const handleToggle = useCallback(async (id: string) => {
    await toggleActive({ id: id as Id<'voiceSkills'> });
  }, [toggleActive]);

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to manage skills.</p>
      </div>
    );
  }

  return (
    <div className={foundationStyles.page}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Skills</h1>
        <p className={foundationStyles.description}>
          Named AI capabilities with their own rules, input/output contracts, and channel adaptation.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      {skills && skills.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          <Badge attention="medium" appearance="neutral" size="m">{skills.length} skills</Badge>
          <Badge attention="medium" appearance="positive" size="m">{skills.filter((s) => s.isActive).length} active</Badge>
        </div>
      )}

      <div className={foundationStyles.content}>
        {skills && skills.length === 0 && (
          <FoundationCard
            title="Get started"
            description="No skills configured yet. Seed the 8 default skills from the PRD."
          >
            <Button attention="high" onClick={handleSeed}>Seed 8 default skills</Button>
          </FoundationCard>
        )}

        {skills && skills.map((skill) => (
          <FoundationCard
            key={skill._id}
            title={skill.name}
            description={skill.description}
            collapsible
            defaultCollapsed
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
                <Badge attention="medium" appearance="neutral" size="m">{skill.category}</Badge>
                <Switch
                  checked={skill.isActive}
                  onCheckedChange={() => handleToggle(skill._id)}
                  size="m"
                />
              </div>
            }
          >
            <div className={styles.propertyList}>
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Skill ID</span>
                <span className={styles.propertyValue}>{skill.skillId}</span>
              </div>
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Version</span>
                <span className={styles.propertyValue}>{skill.version}</span>
              </div>
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Examples</span>
                <span className={styles.propertyValue}>{skill.examples.length}</span>
              </div>
            </div>
            {skill.examples.length > 0 && (
              <div style={{ marginTop: 'var(--Spacing-4-5)', paddingTop: 'var(--Spacing-4-5)', borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
                <div style={{ fontSize: 'var(--Label-S-FontSize)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-Medium)', marginBottom: 'var(--Spacing-3-5)' }}>Example</div>
                <div className={styles.propertyList}>
                  <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-2)' }}>
                    <span className={styles.propertyLabel}>Input</span>
                    <span style={{ fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-High)' }}>{skill.examples[0].input}</span>
                  </div>
                  <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-2)' }}>
                    <span className={styles.propertyLabel}>Output</span>
                    <span style={{ fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-High)' }}>{skill.examples[0].expectedOutput}</span>
                  </div>
                </div>
              </div>
            )}
          </FoundationCard>
        ))}
      </div>
    </div>
  );
}
