/**
 * agents/voice/rules/page.tsx
 *
 * Voice Rules Editor — uses FoundationCard per rule section,
 * matching the Skills/Overview page quality.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../voice.module.css';
import ruleStyles from './rules.module.css';

export default function VoiceRulesPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  // System brand holds the base rules — all brands inherit from it
  const systemBrand = useQuery(api.brands.getBySlug, { slug: 'oneui-system' });
  const systemBrandId = systemBrand?._id;

  // Brand-specific overrides for the current brand
  const brandRules = useQuery(api.voiceRules.getByBrand, brandId ? { brandId } : 'skip');
  // Base rules scoped to the system brand only (not all brands)
  const baseRules = useQuery(api.voiceRules.getSystemBrandBaseRules);

  const seedBaseRules = useMutation(api.voiceRules.seedBaseRules);
  const populateAllBaseContent = useMutation(api.voiceRules.populateAllBaseContent);
  const createOverride = useMutation(api.voiceRules.createOverride);
  const updateContent = useMutation(api.voiceRules.updateContent);
  const removeOverride = useMutation(api.voiceRules.removeOverride);

  const [editingContent, setEditingContent] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Seed base rules on the system brand, not the current brand
  const handleSeedBase = useCallback(async () => {
    if (!systemBrandId) return;
    await seedBaseRules({ brandId: systemBrandId });
  }, [systemBrandId, seedBaseRules]);

  const handlePopulateContent = useCallback(async () => {
    await populateAllBaseContent();
  }, [populateAllBaseContent]);

  const handleStartEdit = useCallback((ruleId: string, content: string) => {
    setEditingId(ruleId);
    setEditingContent(content);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    await updateContent({ id: editingId as Id<'voiceRules'>, content: editingContent });
    setEditingId(null);
  }, [editingId, editingContent, updateContent]);

  const handleCreateOverride = useCallback(async (sectionId: string, baseContent: string) => {
    if (!brandId) return;
    await createOverride({ brandId, sectionId, baseContent });
  }, [brandId, createOverride]);

  const handleResetToBase = useCallback(async (ruleId: string) => {
    await removeOverride({ id: ruleId as Id<'voiceRules'> });
  }, [removeOverride]);

  // Resolve sections: brand overrides take precedence over base rules
  const systemBaseRules = baseRules || [];
  const allSections = useMemo(() =>
    systemBaseRules.map((baseRule) => {
      const brandOverride = brandRules?.find(
        (r) => r.sectionId === baseRule.sectionId && r.scope === 'brand'
      );
      return {
        baseRule,
        brandOverride,
        activeRule: brandOverride || baseRule,
        isOverridden: !!brandOverride,
      };
    }),
    [systemBaseRules, brandRules]
  );

  const hasBaseRules = systemBaseRules.length > 0;
  const hasEmptyRules = allSections.some((s) => !s.activeRule.content);

  const handleDownloadMarkdown = useCallback(() => {
    if (!allSections.length) return;

    const brandName = currentBrand?.name ?? 'Unknown Brand';
    const overrideCount = allSections.filter((s) => s.isOverridden).length;
    const date = new Date().toISOString().split('T')[0];

    const lines: string[] = [
      `# ${brandName} — Voice Rules`,
      '',
      `> Exported on ${date}`,
      '>',
      `> ${allSections.length} rule sections | ${overrideCount} customised | ${allSections.length - overrideCount} inherited from base`,
      '',
      '---',
      '',
    ];

    for (const { activeRule, isOverridden, baseRule } of allSections) {
      const status = isOverridden ? 'Customised' : 'Inherited';
      lines.push(`## ${baseRule.priority}. ${activeRule.title}`);
      lines.push('');
      lines.push(`**Status:** ${status} · **Version:** ${activeRule.version}`);
      lines.push('');
      lines.push(activeRule.content || '*No content defined.*');
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    const markdown = lines.join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-voice-rules-${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [allSections, currentBrand]);

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to manage voice rules.</p>
      </div>
    );
  }

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Voice rules</h1>
        <p className={foundationStyles.description}>
          22 modular rule sections from Core Rules v5. Brand-specific overrides take precedence over base rules.
        </p>
      </div>

      {/* Stats + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
          <Badge attention="medium" appearance="informative" size="m">{systemBaseRules.length} base rules</Badge>
          <Badge attention="medium" appearance="primary" size="m">
            {brandRules?.filter((r) => r.scope === 'brand').length ?? 0} brand overrides
          </Badge>
        </div>
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          {!hasBaseRules && (
            <Button attention="high" size="m" onClick={handleSeedBase}>Seed 22 base rules</Button>
          )}
          {hasBaseRules && hasEmptyRules && (
            <Button attention="high" size="m" onClick={handlePopulateContent}>Populate rule content</Button>
          )}
          {hasBaseRules && (
            <Button attention="medium" size="m" onClick={handleDownloadMarkdown}>Download as Markdown</Button>
          )}
        </div>
      </div>

      <div className={foundationStyles.content}>
        {!hasBaseRules ? (
          <FoundationCard title="Get started" description="No base rules exist yet. Seed the 22 rule sections from Core Rules v5.">
            <Button attention="high" onClick={handleSeedBase}>Seed 22 base rules</Button>
          </FoundationCard>
        ) : (
          allSections.map(({ baseRule, brandOverride, activeRule, isOverridden }) => {
            const isEditing = editingId === activeRule._id;

            return (
              <FoundationCard
                key={baseRule.sectionId}
                title={`${baseRule.priority}. ${activeRule.title}`}
                collapsible
                defaultCollapsed
                actions={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
                    {isOverridden ? (
                      <Badge attention="medium" appearance="primary" size="m">Customised</Badge>
                    ) : (
                      <Badge attention="medium" appearance="informative" size="m">Inherited</Badge>
                    )}
                    {!activeRule.isActive && (
                      <Badge attention="medium" appearance="negative" size="m">Inactive</Badge>
                    )}
                  </div>
                }
              >
                {isEditing ? (
                  <>
                    <textarea
                      className={ruleStyles.ruleTextarea}
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={12}
                    />
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', marginTop: 'var(--Spacing-4)' }}>
                      <Button attention="high" size="m" onClick={handleSaveEdit}>Save</Button>
                      <Button attention="low" size="m" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={ruleStyles.ruleContent}>
                      {activeRule.content || 'No content yet. Click Edit to add rule content.'}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', marginTop: 'var(--Spacing-4-5)', paddingTop: 'var(--Spacing-4-5)', borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
                      {isOverridden && (
                        <Button
                          attention="medium"
                          size="m"
                          onClick={() => handleStartEdit(activeRule._id, activeRule.content)}
                        >
                          Edit
                        </Button>
                      )}
                      {!isOverridden && (
                        <Button
                          attention="medium"
                          size="m"
                          onClick={() => handleCreateOverride(baseRule.sectionId, baseRule.content)}
                        >
                          Create brand override
                        </Button>
                      )}
                      {isOverridden && brandOverride && (
                        <Button
                          attention="low"
                          size="m"
                          onClick={() => handleResetToBase(brandOverride._id)}
                        >
                          Reset to base
                        </Button>
                      )}
                    </div>

                    <div className={styles.propertyList} style={{ marginTop: 'var(--Spacing-4)' }}>
                      <div className={styles.propertyRow}>
                        <span className={styles.propertyLabel}>Version</span>
                        <span className={styles.propertyValue}>{activeRule.version}</span>
                      </div>
                      <div className={styles.propertyRow}>
                        <span className={styles.propertyLabel}>Source</span>
                        <Badge attention="medium" appearance={isOverridden ? 'primary' : 'informative'} size="m">
                          {isOverridden ? 'brand' : 'base'}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </FoundationCard>
            );
          })
        )}
      </div>
    </div>
  );
}
