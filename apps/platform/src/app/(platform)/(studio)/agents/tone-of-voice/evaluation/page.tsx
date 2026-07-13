/**
 * Voice Evaluation Page
 *
 * Scenarios tab: checkbox selection, three-dot menu (edit/delete/rerun), category filter.
 * Runs tab: expanded results with AI responses, dimension scores, pass/fail.
 * Run evaluation: runs selected scenarios with progress indicator.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { MoreVertical } from 'lucide-react';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { CircularProgressIndicator } from '@oneui/ui/components/CircularProgressIndicator';
import { Dialog, DialogPortal } from '@oneui/ui/components/Dialog';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Menu } from '@oneui/ui/components/Menu';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../voice.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'emotion', label: 'Emotion' },
  { id: 'service', label: 'Service' },
  { id: 'safety', label: 'Safety' },
  { id: 'language', label: 'Language' },
  { id: 'tone', label: 'Tone' },
];

export default function VoiceEvaluationPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const scenarios = useQuery(api.voiceEval.listScenarios, brandId ? { brandId } : 'skip');
  const runs = useQuery(api.voiceEval.listRuns, brandId ? { brandId } : 'skip');
  const updateScenario = useMutation(api.voiceEval.updateScenario);
  const removeScenario = useMutation(api.voiceEval.removeScenario);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<string>('scenarios');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Run state
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState<{ current: number; total: number; scenarioId?: string } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  // Edit dialog state
  const [editingScenario, setEditingScenario] = useState<{
    id: Id<'voiceEvalScenarios'>;
    title: string;
    description: string;
    category: string;
    userMessage: string;
    referenceAnswer: string;
    expectedBehaviors: string;
    forbiddenBehaviors: string;
  } | null>(null);

  const filteredScenarios = useMemo(() =>
    scenarios?.filter((s) => selectedCategory === 'all' || s.category === selectedCategory) ?? [],
    [scenarios, selectedCategory]
  );

  const allFilteredSelected = filteredScenarios.length > 0 &&
    filteredScenarios.every((s) => selected.has(s.scenarioId));

  // ---- Selection handlers ----

  const toggleScenario = useCallback((scenarioId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(scenarioId)) next.delete(scenarioId);
      else next.add(scenarioId);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const s of filteredScenarios) next.delete(s.scenarioId);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const s of filteredScenarios) next.add(s.scenarioId);
        return next;
      });
    }
  }, [allFilteredSelected, filteredScenarios]);

  // ---- Run evaluation ----

  const handleRunEval = useCallback(async (specificScenarioIds?: string[]) => {
    if (!brandId || isRunning) return;
    setIsRunning(true);
    setRunError(null);

    const scenarioIds = specificScenarioIds ??
      (selected.size > 0 ? Array.from(selected) : undefined);

    const total = scenarioIds?.length ?? filteredScenarios.length;
    setRunProgress({ current: 0, total });

    try {
      const body: Record<string, unknown> = { brandId };
      if (selectedCategory !== 'all' && !scenarioIds) body.category = selectedCategory;
      if (scenarioIds) body.scenarioIds = scenarioIds;

      const res = await fetch('/api/voice/eval/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Evaluation failed');
      }

      setRunProgress({ current: total, total });
      setActiveTab('runs');
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setIsRunning(false);
      setRunProgress(null);
    }
  }, [brandId, isRunning, selected, selectedCategory, filteredScenarios.length]);

  // ---- Edit handlers ----

  const handleStartEdit = useCallback((scenario: typeof filteredScenarios[0]) => {
    setEditingScenario({
      id: scenario._id,
      title: scenario.title,
      description: scenario.description ?? '',
      category: scenario.category,
      userMessage: scenario.userMessage,
      referenceAnswer: scenario.referenceAnswer ?? '',
      expectedBehaviors: scenario.expectedBehaviors.join('\n'),
      forbiddenBehaviors: scenario.forbiddenBehaviors.join('\n'),
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingScenario) return;
    await updateScenario({
      id: editingScenario.id,
      title: editingScenario.title,
      description: editingScenario.description,
      category: editingScenario.category,
      userMessage: editingScenario.userMessage,
      referenceAnswer: editingScenario.referenceAnswer,
      expectedBehaviors: editingScenario.expectedBehaviors.split('\n').filter(Boolean),
      forbiddenBehaviors: editingScenario.forbiddenBehaviors.split('\n').filter(Boolean),
    });
    setEditingScenario(null);
  }, [editingScenario, updateScenario]);

  const handleDelete = useCallback(async (id: Id<'voiceEvalScenarios'>) => {
    await removeScenario({ id });
  }, [removeScenario]);

  // ---- Render ----

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to manage evaluation.</p>
      </div>
    );
  }

  const selectedCount = selected.size;
  const runLabel = isRunning
    ? `Running${runProgress ? ` ${runProgress.current}/${runProgress.total}` : '...'}`
    : selectedCount > 0
      ? `Run ${selectedCount} selected`
      : 'Run evaluation';

  return (
    <div className={foundationStyles.page}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Evaluation</h1>
        <p className={foundationStyles.description}>
          QnA bank with graded test scenarios. Run evaluations to measure compliance across 11 scoring dimensions.
        </p>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
        <ToggleGroup value={activeTab} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; if (v) setActiveTab(v); }} variant="subtool" size="small">
          <ToggleGroup.Item value="scenarios">Scenarios ({scenarios?.length ?? 0})</ToggleGroup.Item>
          <ToggleGroup.Item value="runs">Runs ({runs?.length ?? 0})</ToggleGroup.Item>
        </ToggleGroup>

        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
          {activeTab === 'scenarios' && (
            <ToggleGroup value={selectedCategory} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; if (v) setSelectedCategory(v); }} variant="subtool" size="compact">
              {CATEGORIES.map((cat) => (
                <ToggleGroup.Item key={cat.id} value={cat.id}>{cat.label}</ToggleGroup.Item>
              ))}
            </ToggleGroup>
          )}

          <Button
            attention="high"
            size="s"
            onPress={() => handleRunEval()}
            disabled={isRunning || !scenarios || scenarios.length === 0}
            loading={isRunning}
          >
            {runLabel}
          </Button>
        </div>
      </div>

      {/* Progress bar during run */}
      {isRunning && runProgress && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)',
          padding: 'var(--Spacing-4)', backgroundColor: 'var(--Primary-Subtle)',
          borderRadius: 'var(--Shape-3)',
        }}>
          <CircularProgressIndicator variant="indeterminate" size="S" aria-label="Running evaluation" />
          <span style={{ fontSize: 'var(--Body-M-FontSize)', color: 'var(--Text-High)' }}>
            Evaluating scenario {runProgress.current} of {runProgress.total}...
          </span>
        </div>
      )}

      {runError && (
        <div style={{
          padding: 'var(--Spacing-3-5)', backgroundColor: 'var(--Negative-Subtle)',
          borderRadius: 'var(--Shape-3)', color: 'var(--Negative-TintedA11y)',
        }}>
          {runError}
        </div>
      )}

      <div className={foundationStyles.content}>
        {/* ===== SCENARIOS TAB ===== */}
        {activeTab === 'scenarios' && (
          <>
            {filteredScenarios.length === 0 ? (
              <FoundationCard
                title="No scenarios"
                description="Add scenarios from the QnA bank v3 to start measuring voice compliance."
              >
                <p className={styles.placeholder}>
                  Scenarios can be seeded via: pnpm seed:voice:eval --brand jio
                </p>
              </FoundationCard>
            ) : (
              <>
                {/* Select all */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)',
                  padding: 'var(--Spacing-3-5) 0',
                }}>
                  <Checkbox
                    checked={allFilteredSelected}
                    indeterminate={selected.size > 0 && !allFilteredSelected}
                    onCheckedChange={toggleAll}
                    size="s"
                    aria-label="Select all scenarios"
                  />
                  <span style={{ fontSize: 'var(--Body-S-FontSize)', color: 'var(--Text-Medium)' }}>
                    {selectedCount > 0 ? `${selectedCount} selected` : `Select all (${filteredScenarios.length})`}
                  </span>
                </div>

                {filteredScenarios.map((scenario) => (
                  <div key={scenario._id} style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'flex-start' }}>
                    <div style={{ paddingTop: 'var(--Spacing-4-5)' }}>
                      <Checkbox
                        checked={selected.has(scenario.scenarioId)}
                        onCheckedChange={() => toggleScenario(scenario.scenarioId)}
                        size="s"
                        aria-label={`Select scenario ${scenario.title}`}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <FoundationCard
                        title={scenario.title}
                        description={scenario.description}
                        collapsible
                        defaultCollapsed
                        actions={
                          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
                            <Badge attention="medium" appearance="neutral" size="m">{scenario.category}</Badge>
                            <Badge attention="medium" appearance={scenario.isActive ? 'positive' : 'neutral'} size="m">
                              {scenario.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Menu>
                              <Menu.Trigger render={
                                <IconButton
                                  attention="low"
                                  icon={<MoreVertical size={16} />}
                                  aria-label="Scenario actions"
                                  size="xs"
                                />
                              } />
                              <Menu.Portal side="bottom" align="end">
                                <Menu.Item onClick={() => handleStartEdit(scenario)}>Edit</Menu.Item>
                                <Menu.Item onClick={() => handleRunEval([scenario.scenarioId])}>
                                  Rerun this scenario
                                </Menu.Item>
                                <Menu.Separator />
                                <Menu.Item onClick={() => handleDelete(scenario._id)}>Delete</Menu.Item>
                              </Menu.Portal>
                            </Menu>
                          </div>
                        }
                      >
                        <div style={{
                          padding: 'var(--Spacing-4)', backgroundColor: 'var(--Primary-Subtle)',
                          borderRadius: 'var(--Shape-4)', marginBottom: 'var(--Spacing-4)',
                        }}>
                          <p style={{ fontSize: 'var(--Body-S-FontSize)', color: 'var(--Text-High)', margin: 0, fontStyle: 'italic' }}>
                            &ldquo;{scenario.userMessage}&rdquo;
                          </p>
                        </div>

                        {scenario.referenceAnswer && (
                          <div style={{ marginBottom: 'var(--Spacing-4)' }}>
                            <span style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 600 }}>
                              Reference answer
                            </span>
                            <p style={{ fontSize: 'var(--Body-S-FontSize)', color: 'var(--Text-High)', margin: 'var(--Spacing-3) 0 0', whiteSpace: 'pre-wrap' }}>
                              {scenario.referenceAnswer}
                            </p>
                          </div>
                        )}

                        <div className={styles.propertyList}>
                          <div className={styles.propertyRow}>
                            <span className={styles.propertyLabel}>Expected behaviours</span>
                            <span className={styles.propertyValue}>{scenario.expectedBehaviors.length}</span>
                          </div>
                          <div className={styles.propertyRow}>
                            <span className={styles.propertyLabel}>Forbidden behaviours</span>
                            <span className={styles.propertyValue}>{scenario.forbiddenBehaviors.length}</span>
                          </div>
                        </div>
                      </FoundationCard>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ===== RUNS TAB ===== */}
        {activeTab === 'runs' && (
          <>
            {(!runs || runs.length === 0) ? (
              <FoundationCard
                title="No evaluation runs"
                description="Select scenarios and click Run evaluation to start."
              >
                {/* Empty-state card — title + description carry the message. */}
                <></>
              </FoundationCard>
            ) : (
              runs.map((run) => (
                <FoundationCard
                  key={run._id}
                  title={run.name || 'Evaluation run'}
                  collapsible
                  defaultCollapsed={false}
                  actions={
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
                      <Badge attention="high" appearance={
                        run.status === 'completed'
                          ? (run.averageScore >= 70 ? 'positive' : 'negative')
                          : run.status === 'failed' ? 'negative' : 'neutral'
                      } size="m">
                        {run.status === 'completed' ? `${Math.round(run.averageScore)}/100` : run.status}
                      </Badge>
                    </div>
                  }
                >
                  {/* Run summary — clean, no background */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--Spacing-4)',
                    paddingBottom: 'var(--Spacing-4-5)',
                  }}>
                    <div>
                      <span style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)' }}>Total</span>
                      <p style={{ fontSize: 'var(--Display-S-FontSize)', fontWeight: 700, color: 'var(--Text-High)', margin: 'var(--Spacing-2) 0 0' }}>
                        {run.totalScenarios}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)' }}>Passed</span>
                      <p style={{ fontSize: 'var(--Display-S-FontSize)', fontWeight: 700, color: 'var(--Positive-TintedA11y)', margin: 'var(--Spacing-2) 0 0' }}>
                        {run.passCount}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)' }}>Failed</span>
                      <p style={{ fontSize: 'var(--Display-S-FontSize)', fontWeight: 700, color: 'var(--Negative-TintedA11y)', margin: 'var(--Spacing-2) 0 0' }}>
                        {run.failCount}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)' }}>Started</span>
                      <p style={{ fontSize: 'var(--Body-M-FontSize)', color: 'var(--Text-High)', margin: 'var(--Spacing-2) 0 0' }}>
                        {new Date(run.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Per-scenario results */}
                  {run.results && (run.results as Array<{
                    scenarioId: string; score: number; passed: boolean;
                    response: string; dimensionScores?: Array<{ dimension: string; score: number; passed: boolean; feedback: string }>;
                    notes?: string;
                  }>).map((result, idx) => (
                    <div key={result.scenarioId}>
                      {/* Divider between tests */}
                      <div style={{ height: 'var(--Stroke-M)', background: 'var(--Neutral-Stroke-Medium, var(--Border-Default))', opacity: 0.12, marginTop: 'var(--Spacing-3-5)', marginBottom: 'var(--Spacing-3-5)' }} />

                      <div style={{ paddingTop: 'var(--Spacing-4-5)', paddingBottom: 'var(--Spacing-4-5)' }}>
                        {/* Scenario header + pass/fail badge + dimension badges — all one row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--Spacing-4)' }}>
                          <span style={{ fontSize: 'var(--Title-M-FontSize)', fontWeight: 700, color: 'var(--Text-High)' }}>
                            {result.scenarioId}
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-1-5)', alignItems: 'center' }}>
                            {result.dimensionScores && result.dimensionScores.map((ds) => (
                              <Badge
                                key={ds.dimension}
                                attention="medium"
                                appearance={ds.passed ? 'positive' : 'negative'}
                                size="m"
                              >
                                {ds.dimension}: {ds.score}/10
                              </Badge>
                            ))}
                            <Badge
                              attention="high"
                              appearance={result.passed ? 'positive' : 'negative'}
                              size="m"
                            >
                              {result.passed ? 'Pass' : 'Fail'} {result.score}/100
                            </Badge>
                          </div>
                        </div>

                        {/* AI response */}
                        {result.response && (
                          <div style={{ marginBottom: 'var(--Spacing-4)' }}>
                            <span style={{ fontSize: 'var(--Label-M-FontSize)', color: 'var(--Text-Medium)', fontWeight: 600, display: 'block', marginBottom: 'var(--Spacing-3)' }}>
                              AI Response
                            </span>
                            <p style={{ fontSize: 'var(--Body-M-FontSize)', color: 'var(--Text-High)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 'var(--Body-M-LineHeight)' }}>
                              {result.response}
                            </p>
                          </div>
                        )}

                        {/* Structured notes — Missing / Violations / Insights */}
                        {result.notes && (() => {
                          const parts = result.notes.split('; ').filter(Boolean);
                          const missing = parts.filter((p) => p.startsWith('Missing:'));
                          const violations = parts.filter((p) => p.startsWith('Violation:'));
                          const insights = parts.filter((p) => !p.startsWith('Missing:') && !p.startsWith('Violation:'));
                          const sections = [
                            { label: 'Missing', items: missing, appearance: 'warning' as const },
                            { label: 'Violations', items: violations, appearance: 'negative' as const },
                            { label: 'Insights', items: insights, appearance: 'neutral' as const },
                          ].filter((s) => s.items.length > 0);

                          return sections.length > 0 ? (
                            <>
                              <div style={{ height: 'var(--Stroke-M)', background: 'var(--Neutral-Stroke-Medium, var(--Border-Default))', opacity: 0.12, marginTop: 'var(--Spacing-3-5)', marginBottom: 'var(--Spacing-4)' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
                                {sections.map((section) => (
                                  <div key={section.label}>
                                    <Badge attention="medium" appearance={section.appearance} size="s">
                                      {section.label} ({section.items.length})
                                    </Badge>
                                    <ul style={{
                                      margin: 'var(--Spacing-3) 0 0',
                                      paddingLeft: 'var(--Spacing-4-5)',
                                      listStyle: 'disc',
                                    }}>
                                      {section.items.map((item, i) => (
                                        <li key={i} style={{
                                          fontSize: 'var(--Body-S-FontSize)',
                                          color: 'var(--Text-Medium)',
                                          lineHeight: 'var(--Body-M-LineHeight)',
                                          marginBottom: 'var(--Spacing-1-5)',
                                        }}>
                                          {item.replace(/^(Missing|Violation):\s*/, '')}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  ))}
                </FoundationCard>
              ))
            )}
          </>
        )}
      </div>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog
        open={!!editingScenario}
        onOpenChange={(open) => { if (!open) setEditingScenario(null); }}
        title="Edit scenario"
        size="large"
      >
        <DialogPortal>
          {editingScenario && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Bold, 700)', display: 'block', marginBottom: 'var(--Spacing-2)' }}>
                  Title
                </label>
                <input
                  className={styles.input}
                  value={editingScenario.title}
                  onChange={(e) => setEditingScenario({ ...editingScenario, title: e.target.value })}
                  style={{ width: '100%', padding: 'var(--Spacing-3-5)', borderRadius: 'var(--Shape-3)', border: 'var(--Stroke-M) solid var(--Border-Subtle)', backgroundColor: 'var(--Primary-Minimal)', color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Bold, 700)', display: 'block', marginBottom: 'var(--Spacing-2)' }}>
                  Category
                </label>
                <select
                  value={editingScenario.category}
                  onChange={(e) => setEditingScenario({ ...editingScenario, category: e.target.value })}
                  style={{ width: '100%', padding: 'var(--Spacing-3-5)', borderRadius: 'var(--Shape-3)', border: 'var(--Stroke-M) solid var(--Border-Subtle)', backgroundColor: 'var(--Primary-Minimal)', color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)' }}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Bold, 700)', display: 'block', marginBottom: 'var(--Spacing-2)' }}>
                  Description
                </label>
                <input
                  value={editingScenario.description}
                  onChange={(e) => setEditingScenario({ ...editingScenario, description: e.target.value })}
                  style={{ width: '100%', padding: 'var(--Spacing-3-5)', borderRadius: 'var(--Shape-3)', border: 'var(--Stroke-M) solid var(--Border-Subtle)', backgroundColor: 'var(--Primary-Minimal)', color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Bold, 700)', display: 'block', marginBottom: 'var(--Spacing-2)' }}>
                  User message
                </label>
                <textarea
                  className={styles.textarea}
                  value={editingScenario.userMessage}
                  onChange={(e) => setEditingScenario({ ...editingScenario, userMessage: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: 'var(--Spacing-3-5)', borderRadius: 'var(--Shape-3)', border: 'var(--Stroke-M) solid var(--Border-Subtle)', backgroundColor: 'var(--Primary-Minimal)', color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 600, display: 'block', marginBottom: 'var(--Spacing-2)' }}>
                  Reference answer
                </label>
                <textarea
                  className={styles.textarea}
                  value={editingScenario.referenceAnswer}
                  onChange={(e) => setEditingScenario({ ...editingScenario, referenceAnswer: e.target.value })}
                  rows={5}
                  style={{ width: '100%', padding: 'var(--Spacing-3-5)', borderRadius: 'var(--Shape-3)', border: 'var(--Stroke-M) solid var(--Border-Subtle)', backgroundColor: 'var(--Primary-Minimal)', color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 600, display: 'block', marginBottom: 'var(--Spacing-2)' }}>
                  Expected behaviours (one per line)
                </label>
                <textarea
                  className={styles.textarea}
                  value={editingScenario.expectedBehaviors}
                  onChange={(e) => setEditingScenario({ ...editingScenario, expectedBehaviors: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: 'var(--Spacing-3-5)', borderRadius: 'var(--Shape-3)', border: 'var(--Stroke-M) solid var(--Border-Subtle)', backgroundColor: 'var(--Primary-Minimal)', color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--Label-S-FontSize)', color: 'var(--Text-Medium)', fontWeight: 600, display: 'block', marginBottom: 'var(--Spacing-2)' }}>
                  Forbidden behaviours (one per line)
                </label>
                <textarea
                  className={styles.textarea}
                  value={editingScenario.forbiddenBehaviors}
                  onChange={(e) => setEditingScenario({ ...editingScenario, forbiddenBehaviors: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: 'var(--Spacing-3-5)', borderRadius: 'var(--Shape-3)', border: 'var(--Stroke-M) solid var(--Border-Subtle)', backgroundColor: 'var(--Primary-Minimal)', color: 'var(--Text-High)', fontSize: 'var(--Body-M-FontSize)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', justifyContent: 'flex-end', marginTop: 'var(--Spacing-3-5)' }}>
                <Button attention="low" size="s" onPress={() => setEditingScenario(null)}>Cancel</Button>
                <Button attention="high" size="s" onPress={handleSaveEdit}>Save changes</Button>
              </div>
            </div>
          )}
        </DialogPortal>
      </Dialog>
    </div>
  );
}
