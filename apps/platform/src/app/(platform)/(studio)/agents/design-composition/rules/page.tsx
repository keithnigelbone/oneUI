/**
 * agents/design-composition/rules/page.tsx
 *
 * Composition Rules Editor — mirrors voice rules page using FoundationCard.
 * Collapsible rule sections, edit content, create brand overrides,
 * add custom rules, export as markdown.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { Input } from '@oneui/ui/components/Input';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../composition.module.css';

export default function CompositionRulesPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const systemBrand = useQuery(api.brands.getBySlug, { slug: 'oneui-system' });
  const systemBrandId = systemBrand?._id;

  const resolvedRules = useQuery(
    (api as any).compositionRules?.getResolved,
    brandId && systemBrandId ? { brandId, systemBrandId } : 'skip'
  );

  const seedDefaults = useMutation((api as any).compositionRules?.seedDefaults);
  const updateContent = useMutation((api as any).compositionRules?.updateContent);
  const upsertRule = useMutation((api as any).compositionRules?.upsert);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSectionId, setNewSectionId] = useState('');

  const handleSeedBase = useCallback(async () => {
    if (!systemBrandId) return;
    try {
      await seedDefaults({ brandId: systemBrandId, scope: 'base' });
    } catch {
      // Already exists
    }
  }, [systemBrandId, seedDefaults]);

  const handleStartEdit = useCallback((ruleId: string, content: string) => {
    setEditingId(ruleId);
    setEditingContent(content);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    await updateContent({ id: editingId as Id<'compositionRules'>, content: editingContent });
    setEditingId(null);
  }, [editingId, editingContent, updateContent]);

  const handleCreateOverride = useCallback(
    async (sectionId: string, baseContent: string, title: string, priority: number) => {
      if (!brandId) return;
      await upsertRule({
        brandId,
        sectionId,
        scope: 'brand',
        title,
        content: baseContent,
        priority,
      });
    },
    [brandId, upsertRule],
  );

  const handleAddRule = useCallback(async () => {
    if (!brandId || !newTitle.trim()) return;
    const sectionId = newSectionId.trim() || newTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const rules = resolvedRules ?? [];
    const maxPriority = rules.reduce((max: number, r: any) => Math.max(max, r.priority), 0);

    await upsertRule({
      brandId,
      sectionId,
      scope: 'brand',
      title: newTitle.trim(),
      content: newContent.trim() || 'Define your composition rule here.',
      priority: maxPriority + 1,
    });
    setNewTitle('');
    setNewContent('');
    setNewSectionId('');
    setShowAddForm(false);
  }, [brandId, newTitle, newContent, newSectionId, resolvedRules, upsertRule]);

  const handleExportMarkdown = useCallback(() => {
    const rules = resolvedRules ?? [];
    if (!rules.length) return;

    const brandName = currentBrand?.name ?? 'Brand';
    const date = new Date().toISOString().split('T')[0];
    const overrideCount = rules.filter((r: any) => r.source === 'brand').length;

    const lines: string[] = [
      `# ${brandName} — Composition Rules`,
      '',
      `> Exported on ${date}`,
      '>',
      `> ${rules.length} rule sections | ${overrideCount} customised | ${rules.length - overrideCount} inherited from base`,
      '',
      '---',
      '',
    ];

    for (const rule of rules) {
      const status = rule.source === 'brand' ? 'Customised' : 'Inherited';
      lines.push(`## ${rule.priority}. ${rule.title}`);
      lines.push('');
      lines.push(`**Status:** ${status} · **Version:** ${rule.version} · **Scope:** ${rule.scope}`);
      if (rule.contexts?.length) {
        lines.push(`**Contexts:** ${rule.contexts.join(', ')}`);
      }
      if (rule.vertical) {
        lines.push(`**Vertical:** ${rule.vertical}`);
      }
      lines.push('');
      lines.push(rule.content || '*No content defined.*');
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-composition-rules.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [resolvedRules, currentBrand]);

  const rules = resolvedRules ?? [];
  const hasRules = rules.length > 0;

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to manage composition rules.</p>
      </div>
    );
  }

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Rules</h1>
        <p className={foundationStyles.description}>
          Modular rule sections that control how the agent composes UI — surface usage, attention hierarchy,
          typography, spacing, component selection, and do&rsquo;s and don&rsquo;ts. Brand rules override base rules.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      {hasRules && (
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          <Badge attention="medium" appearance="neutral" size="m">{rules.length} sections</Badge>
          <Badge attention="medium" appearance="positive" size="m">
            {rules.filter((r: any) => r.source === 'brand').length} customised
          </Badge>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--Spacing-3)' }}>
            <Button attention="low" appearance="neutral" size="xs" onPress={handleExportMarkdown}>
              Export Markdown
            </Button>
            <Button attention="medium" appearance="primary" size="xs" onPress={() => setShowAddForm(true)}>
              Add Rule
            </Button>
          </div>
        </div>
      )}

      <div className={foundationStyles.content}>
        {!hasRules && resolvedRules !== undefined && (
          <FoundationCard
            title="Get started"
            description="No composition rules found. Seed the base rules covering layout, surface, typography, attention, spacing, and accessibility."
          >
            <Button attention="high" onClick={handleSeedBase}>Seed base rules</Button>
          </FoundationCard>
        )}

        {resolvedRules === undefined && (
          <FoundationCard title="Loading...">
            <p className={styles.propertyLabel}>Loading composition rules...</p>
          </FoundationCard>
        )}

        {/* Add rule form */}
        {showAddForm && (
          <FoundationCard title="New composition rule">
            <div className={styles.propertyList}>
              <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
                <span className={styles.propertyLabel}>Title</span>
                <Input
                  value={newTitle}
                  onChange={setNewTitle}
                  placeholder="e.g. Card Design Patterns"
                />
              </div>
              <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
                <span className={styles.propertyLabel}>Content</span>
                <textarea
                  className={styles.ruleTextarea}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Define your composition rule — surfaces, attention levels, typography, spacing, do's and don'ts..."
                  rows={8}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-4)' }}>
              <Button attention="high" size="s" onPress={handleAddRule} disabled={!newTitle.trim()}>
                Create Rule
              </Button>
              <Button attention="low" appearance="neutral" size="s" onPress={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </FoundationCard>
        )}

        {/* Rule list */}
        {rules.map((rule: any) => {
          const isEditing = editingId === rule._id;
          const source = rule.source as 'base' | 'brand';

          return (
            <FoundationCard
              key={rule._id}
              title={`${rule.priority}. ${rule.title}`}
              collapsible
              defaultCollapsed
              actions={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
                  <Badge
                    attention="medium"
                    appearance={source === 'brand' ? 'primary' : 'neutral'}
                    size="m"
                  >
                    {source === 'brand' ? 'Customised' : 'Base'}
                  </Badge>
                  {rule.contexts?.length > 0 && !rule.contexts.includes('all') && (
                    <Badge attention="low" appearance="neutral" size="s">
                      {rule.contexts.join(', ')}
                    </Badge>
                  )}
                </div>
              }
            >
              {isEditing ? (
                <>
                  <textarea
                    className={styles.ruleTextarea}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={12}
                  />
                  <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-3-5)' }}>
                    <Button attention="high" size="xs" onPress={handleSaveEdit}>Save</Button>
                    <Button attention="low" appearance="neutral" size="xs" onPress={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.ruleContent}>
                    {rule.content || 'No content defined.'}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-4)' }}>
                    <Button attention="medium" appearance="neutral" size="xs" onPress={() => handleStartEdit(rule._id, rule.content)}>
                      Edit
                    </Button>
                    {source === 'base' && (
                      <Button attention="medium" appearance="primary" size="xs" onPress={() => handleCreateOverride(rule.sectionId, rule.content, rule.title, rule.priority)}>
                        Create Brand Override
                      </Button>
                    )}
                  </div>
                  <div className={styles.ruleMeta}>
                    <span>v{rule.version}</span>
                    <span>Scope: {rule.scope}</span>
                    {rule.vertical && <span>Vertical: {rule.vertical}</span>}
                  </div>
                </>
              )}
            </FoundationCard>
          );
        })}
      </div>
    </div>
  );
}
