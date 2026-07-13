/**
 * agents/design-composition/skills/page.tsx
 *
 * Composition Skills — mirrors voice skills page using FoundationCard.
 * Full editing of skill content, add new skills, export as markdown.
 * Skills cover: foundation usage, surfaces, attention, typography,
 * component selection, do's and don'ts, not just layout patterns.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { Switch } from '@oneui/ui/components/Switch';
import { Input } from '@oneui/ui/components/Input';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { SkillWriterPanel } from './SkillWriterPanel';
import { SkillBriefGenerator } from './SkillBriefGenerator';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../composition.module.css';

const VERTICALS = [
  'entertainment',
  'e-commerce',
  'finance',
  'governance',
  'farm',
  'iot',
  'telecom',
  'mobility',
  'health',
  'general',
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  screen: 'Screen Archetype',
  pattern: 'Composition Pattern',
  flow: 'Multi-Screen Flow',
};

export default function CompositionSkillsPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const skills = useQuery(
    api.compositionSkills.list,
    brandId ? { brandId } : 'skip'
  );

  const seedDefaults = useMutation(api.compositionSkills.seedDefaults);
  const toggleActive = useMutation(api.compositionSkills.toggleActive);
  const createSkill = useMutation(api.compositionSkills.create);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTemplate, setNewTemplate] = useState('');

  const handleSeed = useCallback(async () => {
    if (!brandId) return;
    try {
      await seedDefaults({ brandId });
    } catch {
      // Already exists
    }
  }, [brandId, seedDefaults]);

  const handleToggle = useCallback(async (id: string) => {
    await toggleActive({ id: id as Id<'compositionSkills'> });
  }, [toggleActive]);

  const handleStartEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const handleAddSkill = useCallback(async () => {
    if (!brandId || !newName.trim()) return;
    const skillId = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await createSkill({
      brandId,
      skillId,
      name: newName.trim(),
      description: newDescription.trim() || `Custom composition skill: ${newName.trim()}`,
      category: 'pattern',
      systemPromptTemplate: newTemplate.trim() || `Generate a composition for {brand} following the ${newName.trim()} pattern.`,
      applicableContexts: ['mobile-app', 'web-app', 'marketing-page', 'social-post'],
    });
    setNewName('');
    setNewDescription('');
    setNewTemplate('');
    setShowAddForm(false);
  }, [brandId, newName, newDescription, newTemplate, createSkill]);

  const handleExportMarkdown = useCallback(() => {
    if (!skills || !skills.length) return;

    const brandName = currentBrand?.name ?? 'Brand';
    const date = new Date().toISOString().split('T')[0];
    const activeCount = skills.filter((s: any) => s.isActive).length;

    const lines: string[] = [
      `# ${brandName} — Composition Skills`,
      '',
      `> Exported on ${date}`,
      '>',
      `> ${skills.length} skills | ${activeCount} active`,
      '',
      '---',
      '',
    ];

    for (const skill of skills) {
      const status = skill.isActive ? 'Active' : 'Inactive';
      lines.push(`## ${skill.name}`);
      lines.push('');
      lines.push(`**Category:** ${CATEGORY_LABELS[skill.category] ?? skill.category} · **Status:** ${status} · **Version:** ${skill.version}`);
      lines.push('');
      lines.push(`**Contexts:** ${skill.applicableContexts.join(', ')}`);
      lines.push('');
      lines.push('### Description');
      lines.push('');
      lines.push(skill.description);
      lines.push('');
      lines.push('### Prompt Template');
      lines.push('');
      lines.push('```');
      lines.push(skill.systemPromptTemplate);
      lines.push('```');
      lines.push('');
      if (skill.examples?.length > 0) {
        lines.push('### Examples');
        lines.push('');
        for (const ex of skill.examples) {
          lines.push(`**Prompt:** ${ex.prompt}`);
          if (ex.context) lines.push(`**Context:** ${ex.context}`);
          lines.push('');
        }
      }
      lines.push('---');
      lines.push('');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-composition-skills.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [skills, currentBrand]);

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to manage composition skills.</p>
      </div>
    );
  }

  const hasSkills = skills && skills.length > 0;

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Skills</h1>
        <p className={foundationStyles.description}>
          Named composition patterns with their own rules, prompt templates, and examples.
          Skills cover foundation usage, surface application, attention levels, typography, do&rsquo;s and don&rsquo;ts.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      {hasSkills && (
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          <Badge attention="medium" appearance="neutral" size="m">{skills.length} skills</Badge>
          <Badge attention="medium" appearance="positive" size="m">{skills.filter((s: any) => s.isActive).length} active</Badge>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--Spacing-3)' }}>
            <Button attention="low" appearance="neutral" size="xs" onPress={handleExportMarkdown}>
              Export Markdown
            </Button>
            <Button attention="low" appearance="neutral" size="xs" onPress={() => setShowAddForm(true)}>
              Add manually
            </Button>
            <Button
              attention="high"
              appearance="primary"
              size="xs"
              onPress={() => {
                setShowAIGenerator(true);
                setShowAddForm(false);
              }}
            >
              Generate with AI
            </Button>
          </div>
        </div>
      )}

      <div className={foundationStyles.content}>
        {skills && skills.length === 0 && !showAIGenerator && (
          <FoundationCard
            title="Get started"
            description="No composition skills configured yet. Either seed the canonical defaults, or describe a brief and let Claude draft a skill from scratch."
          >
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap' }}>
              <Button attention="high" appearance="primary" onClick={() => setShowAIGenerator(true)}>
                Generate with AI
              </Button>
              <Button attention="medium" appearance="neutral" onClick={handleSeed}>
                Seed defaults
              </Button>
            </div>
          </FoundationCard>
        )}

        {/* AI brief generator */}
        {showAIGenerator && brandId && (
          <SkillBriefGenerator
            brandId={brandId}
            brandName={currentBrand?.name}
            onSaved={() => {
              setShowAIGenerator(false);
            }}
            onCancel={() => setShowAIGenerator(false)}
          />
        )}

        {/* Add skill form */}
        {showAddForm && (
          <FoundationCard title="New composition skill">
            <div className={styles.propertyList}>
              <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
                <span className={styles.propertyLabel}>Name</span>
                <Input
                  value={newName}
                  onChange={setNewName}
                  placeholder="e.g. Product Card Grid"
                />
              </div>
              <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
                <span className={styles.propertyLabel}>Description</span>
                <Input
                  value={newDescription}
                  onChange={setNewDescription}
                  placeholder="What this skill covers — surfaces, attention, typography rules..."
                />
              </div>
              <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
                <span className={styles.propertyLabel}>Prompt template</span>
                <textarea
                  className={styles.ruleTextarea}
                  value={newTemplate}
                  onChange={(e) => setNewTemplate(e.target.value)}
                  placeholder="Generate a {vertical} composition for {brand}. Use {tokens} for spacing..."
                  rows={6}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-4)' }}>
              <Button attention="high" size="s" onPress={handleAddSkill} disabled={!newName.trim()}>
                Create Skill
              </Button>
              <Button attention="low" appearance="neutral" size="s" onPress={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </FoundationCard>
        )}

        {/* Skill list */}
        {hasSkills && skills.map((skill: any) => (
          <FoundationCard
            key={skill._id}
            title={skill.name}
            description={skill.description}
            collapsible
            defaultCollapsed
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
                <Badge attention="medium" appearance="neutral" size="m">
                  {CATEGORY_LABELS[skill.category] ?? skill.category}
                </Badge>
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
                <span className={styles.propertyLabel}>Contexts</span>
                <span className={styles.propertyValue}>{skill.applicableContexts.join(', ')}</span>
              </div>
              <div className={styles.propertyRow}>
                <span className={styles.propertyLabel}>Examples</span>
                <span className={styles.propertyValue}>{skill.examples?.length ?? 0}</span>
              </div>
            </div>

            {/* Prompt template — editable */}
            <div style={{ marginTop: 'var(--Spacing-4-5)', paddingTop: 'var(--Spacing-4-5)', borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
              <div style={{ fontSize: 'var(--Label-S-FontSize)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-Medium)', marginBottom: 'var(--Spacing-3-5)' }}>
                Prompt Template
              </div>
              {editingId === skill._id ? (
                <SkillWriterPanel
                  skill={skill}
                  brandName={currentBrand?.name}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className={styles.ruleContent}>{skill.systemPromptTemplate}</div>
                  <div style={{ marginTop: 'var(--Spacing-3-5)' }}>
                    <Button attention="medium" appearance="neutral" size="xs" onPress={() => handleStartEdit(skill._id)}>
                      Edit Template
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Pack Editor — the skill becomes a bundle external LLMs query */}
            <PackEditor skill={skill} />

            {/* Examples */}
            {skill.examples?.length > 0 && (
              <div style={{ marginTop: 'var(--Spacing-4-5)', paddingTop: 'var(--Spacing-4-5)', borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
                <div style={{ fontSize: 'var(--Label-S-FontSize)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-Medium)', marginBottom: 'var(--Spacing-3-5)' }}>
                  Example
                </div>
                <div className={styles.propertyList}>
                  <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-2)' }}>
                    <span className={styles.propertyLabel}>Prompt</span>
                    <span style={{ fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-High)', fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))' }}>
                      {skill.examples[0].prompt}
                    </span>
                  </div>
                  {skill.examples[0].context && (
                    <div className={styles.propertyRow}>
                      <span className={styles.propertyLabel}>Context</span>
                      <span className={styles.propertyValue}>{skill.examples[0].context}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </FoundationCard>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PackEditor — turn a skill into a bundle (archetype + vertical
// + linked rules + linked references + do/don'ts + attention).
// This is what the /api/agent/context-pack endpoint returns to
// external LLMs (Claude Code, Cursor, MCP clients).
// ============================================================

function PackEditor({ skill }: { skill: any }) {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const allRules = useQuery(
    (api as any).compositionRules?.getByBrand,
    brandId ? { brandId } : 'skip',
  ) as Array<{ _id: string; sectionId: string; title: string }> | undefined;

  const allScreens = useQuery(
    (api as any).references?.listScreens,
    { status: 'approved' },
  ) as Array<{ _id: string; name: string; archetype: string; context: string }> | undefined;

  const updateSkill = useMutation(api.compositionSkills.update);

  const [showAllRefs, setShowAllRefs] = useState(false);
  const [autoLinking, setAutoLinking] = useState(false);
  const [autoLinkSummary, setAutoLinkSummary] = useState<string | null>(null);

  const [archetype, setArchetype] = useState<string>(skill.archetype ?? '');
  const [vertical, setVertical] = useState<string>(skill.vertical ?? '');
  const [attentionPattern, setAttentionPattern] = useState<string>(
    skill.attentionPattern ?? '',
  );
  const [dosDontsText, setDosDontsText] = useState<string>(
    (skill.dosDonts ?? []).join('\n'),
  );
  const [linkedRules, setLinkedRules] = useState<string[]>(
    skill.linkedRuleSectionIds ?? [],
  );
  const [linkedRefs, setLinkedRefs] = useState<string[]>(
    skill.linkedReferenceScreenIds ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const availableArchetypes = useMemo(() => {
    const set = new Set<string>();
    (allScreens ?? []).forEach((s) => set.add(s.archetype));
    return [...set].sort();
  }, [allScreens]);

  /** Relevance score: 3 = archetype match, 2 = archetype contained in name,
   *  1 = context match only, 0 = unrelated. Already-linked screens always
   *  remain visible so the user can untick them. */
  const scoredScreens = useMemo(() => {
    const list = allScreens ?? [];
    const arch = (archetype || '').toLowerCase();
    const contexts = new Set<string>(skill.applicableContexts ?? []);
    return list
      .map((s) => {
        const name = s.name.toLowerCase();
        const sArch = s.archetype.toLowerCase();
        let score = 0;
        if (arch && sArch === arch) score = 3;
        else if (arch && (sArch.includes(arch) || arch.includes(sArch) || name.includes(arch))) score = 2;
        else if (contexts.size > 0 && contexts.has(s.context)) score = 1;
        const isLinked = linkedRefs.includes(s._id);
        return { screen: s, score, isLinked };
      })
      .sort((a, b) => {
        if (a.isLinked !== b.isLinked) return a.isLinked ? -1 : 1;
        return b.score - a.score;
      });
  }, [allScreens, archetype, linkedRefs, skill.applicableContexts]);

  const visibleScreens = useMemo(
    () =>
      showAllRefs
        ? scoredScreens
        : scoredScreens.filter((r) => r.isLinked || r.score >= 2),
    [scoredScreens, showAllRefs],
  );

  const hiddenCount = scoredScreens.length - visibleScreens.length;

  const handleAutoLink = useCallback(async () => {
    setAutoLinking(true);
    setAutoLinkSummary(null);
    try {
      const res = await fetch('/api/skills/auto-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: skill._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAutoLinkSummary(`Error: ${data?.error ?? res.statusText}`);
        return;
      }
      setLinkedRefs(data.screenIds ?? []);
      setAutoLinkSummary(
        data.screenIds?.length
          ? `Linked ${data.screenIds.length} screens. ${data.reasoning ?? ''}`
          : `No matches found. ${data.reasoning ?? ''}`,
      );
    } catch (err) {
      setAutoLinkSummary(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setAutoLinking(false);
    }
  }, [skill._id]);

  const handleSave = useCallback(async () => {
    if (!updateSkill) return;
    setSaving(true);
    try {
      await updateSkill({
        id: skill._id,
        archetype: archetype || undefined,
        vertical: vertical || undefined,
        attentionPattern: attentionPattern || undefined,
        dosDonts: dosDontsText
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
        linkedRuleSectionIds: linkedRules,
        linkedReferenceScreenIds: linkedRefs as Id<'referenceScreens'>[],
      });
    } finally {
      setSaving(false);
    }
  }, [
    archetype,
    attentionPattern,
    dosDontsText,
    linkedRefs,
    linkedRules,
    skill._id,
    updateSkill,
    vertical,
  ]);

  const handleTestPack = useCallback(async () => {
    if (!currentBrand) return;
    setTesting(true);
    setTestOutput(null);
    try {
      const res = await fetch('/api/agent/context-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: currentBrand.name,
          vertical: vertical || undefined,
          archetype: archetype || undefined,
          context: (skill.applicableContexts?.[0] ?? 'mobile-app'),
          skillId: skill.skillId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestOutput(`Error: ${data?.error ?? res.statusText}`);
        return;
      }
      const lines = [
        `# Context Pack for ${skill.name}`,
        ``,
        `**Brand:** ${data.brand?.name ?? '—'} · **Context:** ${skill.applicableContexts?.[0] ?? 'mobile-app'} · **Archetype:** ${archetype || '—'} · **Vertical:** ${vertical || '—'}`,
        `**Size:** ${data.size}c · **Cached:** ${data.cached ? 'yes' : 'no'}${data.warnings?.length ? ` · **Warnings:** ${data.warnings.join('; ')}` : ''}`,
        `**Cited skills:** ${data.citedSkillIds?.join(', ') || '—'}`,
        `**Cited references:** ${data.citedReferenceScreenIds?.length || 0}`,
        `**Images:** ${data.images?.length || 0}`,
        ``,
        `---`,
        ``,
        data.systemPrompt ?? '',
      ].join('\n');
      setTestOutput(lines);
      try {
        await navigator.clipboard.writeText(lines);
      } catch {
        // non-fatal
      }
    } catch (err) {
      setTestOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTesting(false);
    }
  }, [archetype, currentBrand, skill._id, skill.applicableContexts, skill.name, skill.skillId, vertical]);

  return (
    <div
      style={{
        marginTop: 'var(--Spacing-4-5)',
        paddingTop: 'var(--Spacing-4-5)',
        borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 'var(--Spacing-3-5)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 'var(--Label-S-FontSize)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
              color: 'var(--Text-Medium)',
            }}
          >
            Skill Pack
          </div>
          <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginTop: 'var(--Spacing-1-5)' }}>
            Everything external LLMs need: archetype, vertical, rules, references, attention recipe, do/don&rsquo;ts.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
          <Button attention="low" appearance="neutral" size="xs" onPress={handleTestPack} disabled={testing}>
            {testing ? 'Fetching…' : 'Test Pack (copy markdown)'}
          </Button>
          <Button attention="high" size="xs" onPress={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Pack'}
          </Button>
        </div>
      </div>

      <div className={styles.propertyList}>
        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Archetype</span>
          <Input
            value={archetype}
            onChange={setArchetype}
            placeholder="product-grid · hero · player · settings · …"
            {...({ list: `archetypes-${skill._id}` } as { list: string })}
          />
          <datalist id={`archetypes-${skill._id}`}>
            {availableArchetypes.map((a) => <option key={a} value={a} />)}
          </datalist>
        </div>

        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Vertical</span>
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--Spacing-3) var(--Spacing-3-5)',
              fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
              fontSize: 'var(--Body-M-FontSize)',
              background: 'var(--Surface-Main)',
              color: 'var(--Text-High)',
              border: 'var(--Stroke-M) solid var(--Border-Subtle)',
              borderRadius: 'var(--Shape-3-5)',
            }}
          >
            <option value="">— unspecified —</option>
            {VERTICALS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Attention recipe (one sentence)</span>
          <Input
            value={attentionPattern}
            onChange={setAttentionPattern}
            placeholder="One high-attention CTA per card; price at Body-M; filters at low-attention ghost."
          />
        </div>

        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>Do / Don&rsquo;t (one per line)</span>
          <textarea
            className={styles.ruleTextarea}
            value={dosDontsText}
            onChange={(e) => setDosDontsText(e.target.value)}
            rows={5}
            placeholder={'Do: use default surface for product grids — cards never fill.\nDon\'t: stack multiple high-attention CTAs in one card.'}
          />
        </div>

        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <span className={styles.propertyLabel}>
            Linked rules ({linkedRules.length}/{allRules?.length ?? 0})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)', maxHeight: 200, overflowY: 'auto' }}>
            {(allRules ?? []).map((r) => {
              const checked = linkedRules.includes(r.sectionId);
              return (
                <label key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)', fontSize: 'var(--Body-S-FontSize)' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setLinkedRules((prev) =>
                        e.target.checked
                          ? [...prev, r.sectionId]
                          : prev.filter((id) => id !== r.sectionId),
                      );
                    }}
                  />
                  <span>{r.title} <span style={{ color: 'var(--Text-Low)' }}>· {r.sectionId}</span></span>
                </label>
              );
            })}
          </div>
          <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)' }}>
            Empty selection = include all brand rules (compiler still filters by context + vertical).
          </div>
        </div>

        <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--Spacing-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--Spacing-3-5)' }}>
            <span className={styles.propertyLabel}>
              Linked references ({linkedRefs.length}/{allScreens?.length ?? 0})
            </span>
            <div style={{ display: 'flex', gap: 'var(--Spacing-3)' }}>
              <Button
                attention="medium"
                appearance="neutral"
                size="xs"
                onPress={handleAutoLink}
                disabled={autoLinking}
              >
                {autoLinking ? 'Matching…' : 'Auto-link'}
              </Button>
              <Button
                attention="low"
                appearance="neutral"
                size="xs"
                onPress={() => setShowAllRefs((s) => !s)}
              >
                {showAllRefs ? 'Hide unrelated' : `Show all (+${hiddenCount})`}
              </Button>
            </div>
          </div>
          {autoLinkSummary && (
            <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Medium)' }}>
              {autoLinkSummary}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)', maxHeight: 240, overflowY: 'auto' }}>
            {visibleScreens.length === 0 && (
              <div style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-S-FontSize)' }}>
                No references match this skill&rsquo;s archetype or context yet. Click &ldquo;Auto-link&rdquo; to let the agent pick, or &ldquo;Show all&rdquo; to browse the catalog.
              </div>
            )}
            {visibleScreens.map(({ screen: s, score, isLinked }) => {
              const relevance =
                score >= 3 ? 'archetype match' : score === 2 ? 'partial match' : score === 1 ? 'context only' : 'unrelated';
              return (
                <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)', fontSize: 'var(--Body-S-FontSize)' }}>
                  <input
                    type="checkbox"
                    checked={isLinked}
                    onChange={(e) => {
                      setLinkedRefs((prev) =>
                        e.target.checked
                          ? [...prev, s._id]
                          : prev.filter((id) => id !== s._id),
                      );
                    }}
                  />
                  <span style={{ flex: 1 }}>
                    {s.name}{' '}
                    <span style={{ color: 'var(--Text-Low)' }}>· {s.archetype} · {s.context}</span>
                  </span>
                  <Badge
                    attention="medium"
                    size="s"
                    appearance={
                      score >= 3 ? 'positive' : score === 2 ? 'informative' : score === 1 ? 'neutral' : 'warning'
                    }
                  >
                    {relevance}
                  </Badge>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {testOutput !== null && (
        <div style={{ marginTop: 'var(--Spacing-4)' }}>
          <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-2)' }}>
            Copied to clipboard — paste into Cursor or Claude Code to sanity-check the prompt before wrapping in MCP.
          </div>
          <pre
            style={{
              background: 'var(--Surface-Low)',
              border: 'var(--Stroke-M) solid var(--Border-Subtle)',
              borderRadius: 'var(--Shape-3-5)',
              padding: 'var(--Spacing-4)',
              fontFamily: 'var(--Typography-Font-Code)',
              fontSize: 'var(--Code-S-FontSize)',
              lineHeight: 'var(--Code-S-LineHeight)',
              maxHeight: 360,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {testOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
