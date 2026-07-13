/**
 * agents/design-composition/evaluation/page.tsx
 *
 * Composition Evaluation — scenario bank + run results.
 * Mirrors voice evaluation page: scenarios tab with selection,
 * runs tab with expanded results.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { RetrievalTracePanel } from '../playground/RetrievalTracePanel';
import foundationStyles from '../../../foundations/foundation.module.css';
import styles from '../composition.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'layout', label: 'Layout' },
  { id: 'surface', label: 'Surface' },
  { id: 'typography', label: 'Typography' },
  { id: 'attention', label: 'Attention' },
  { id: 'accessibility', label: 'Accessibility' },
];

export default function CompositionEvaluationPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const scenarios = useQuery(
    (api as any).compositionEval?.listScenarios,
    brandId ? { brandId } : 'skip'
  );
  const runs = useQuery(
    (api as any).compositionEval?.listRuns,
    brandId ? { brandId } : 'skip'
  );

  const [activeTab, setActiveTab] = useState<'scenarios' | 'runs'>('scenarios');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [lastRunResult, setLastRunResult] = useState<any>(null);

  const filteredScenarios = useMemo(() =>
    (scenarios ?? []).filter((s: any) => selectedCategory === 'all' || s.category === selectedCategory),
    [scenarios, selectedCategory]
  );

  const handleRunEvaluation = useCallback(async () => {
    if (!scenarios?.length) return;
    setIsRunning(true);
    setRunError(null);

    try {
      const activeScenarios = scenarios.filter((s: any) => s.isActive);
      const res = await fetch('/api/composition/eval/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarios: activeScenarios,
          brandName: currentBrand?.name,
          // Required for the RAG path (RFC 0002). Server falls back to the
          // deterministic compile when the flag is off or the brand has no
          // embeddings yet, so passing this is always safe.
          brandId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Evaluation failed' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setLastRunResult(data);
      setActiveTab('runs');
    } catch (err: any) {
      setRunError(err.message || 'Evaluation failed');
    } finally {
      setIsRunning(false);
    }
  }, [scenarios, currentBrand]);

  if (!brandId) {
    return (
      <div className={foundationStyles.page}>
        <p className={foundationStyles.description}>Select a brand to run evaluations.</p>
      </div>
    );
  }

  return (
    <div className={foundationStyles.page} style={{ paddingBottom: 'var(--Spacing-7)' }}>
      <div className={foundationStyles.header}>
        <h1 className={foundationStyles.title}>Evaluation</h1>
        <p className={foundationStyles.description}>
          Test composition quality against predefined scenarios. Each scenario checks layout structure,
          token compliance, surface correctness, and attention hierarchy.
          {currentBrand && (
            <span className={foundationStyles.brandIndicator}>
              {' '}Evaluating for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
        <Button
          attention={activeTab === 'scenarios' ? 'high' : 'low'}
          appearance={activeTab === 'scenarios' ? 'primary' : 'neutral'}
          size="xs"
          onPress={() => setActiveTab('scenarios')}
        >
          Scenarios
        </Button>
        <Button
          attention={activeTab === 'runs' ? 'high' : 'low'}
          appearance={activeTab === 'runs' ? 'primary' : 'neutral'}
          size="xs"
          onPress={() => setActiveTab('runs')}
        >
          Runs
        </Button>
        {activeTab === 'scenarios' && scenarios && scenarios.length > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <Button
              attention="high"
              size="xs"
              onPress={handleRunEvaluation}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : `Run ${scenarios.filter((s: any) => s.isActive).length} Scenarios`}
            </Button>
          </div>
        )}
      </div>

      {runError && (
        <div style={{ color: 'var(--Negative-TintedA11y)', fontSize: 'var(--Body-S-FontSize)', fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))' }}>
          {runError}
        </div>
      )}

      <div className={foundationStyles.content}>
        {/* ── Scenarios tab ──────────────────────────────────────── */}
        {activeTab === 'scenarios' && (
          <>
            {(!scenarios || scenarios.length === 0) && (
              <FoundationCard
                title="No scenarios yet"
                description="Evaluation scenarios will be created as you use the feedback system. Scenarios can also be added manually from the composition rules."
              >
                <p className={styles.propertyLabel}>
                  Scenarios test specific composition patterns — surface usage, attention hierarchy,
                  typography roles, spacing consistency, and accessibility compliance.
                </p>
              </FoundationCard>
            )}

            {/* Category filter */}
            {scenarios && scenarios.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--Spacing-2)', flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={styles.contextChip}
                    data-active={selectedCategory === cat.id ? 'true' : undefined}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {filteredScenarios.map((scenario: any) => (
              <FoundationCard
                key={scenario._id}
                title={scenario.title}
                description={scenario.description || scenario.prompt}
                collapsible
                defaultCollapsed
                actions={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
                    <Badge attention="medium" appearance="neutral" size="m">{scenario.category}</Badge>
                    <Badge attention="medium" appearance="neutral" size="m">{scenario.context}</Badge>
                    <Badge
                      attention="medium"
                      appearance={scenario.isActive ? 'positive' : 'neutral'}
                      size="m"
                    >
                      {scenario.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                }
              >
                <div className={styles.propertyList}>
                  <div className={styles.propertyRow}>
                    <span className={styles.propertyLabel}>Prompt</span>
                    <span className={styles.propertyValue}>{scenario.prompt}</span>
                  </div>
                  <div className={styles.propertyRow}>
                    <span className={styles.propertyLabel}>Context</span>
                    <span className={styles.propertyValue}>{scenario.context}</span>
                  </div>
                  <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-2)' }}>
                    <span className={styles.propertyLabel}>Expected behaviours</span>
                    <ul style={{ margin: 0, paddingLeft: 'var(--Spacing-4)', fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-High)', fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))' }}>
                      {scenario.expectedBehaviors.map((b: string, i: number) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  {scenario.forbiddenBehaviors.length > 0 && (
                    <div className={styles.propertyRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-2)' }}>
                      <span className={styles.propertyLabel}>Forbidden behaviours</span>
                      <ul style={{ margin: 0, paddingLeft: 'var(--Spacing-4)', fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Negative-TintedA11y)', fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))' }}>
                        {scenario.forbiddenBehaviors.map((b: string, i: number) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </FoundationCard>
            ))}
          </>
        )}

        {/* ── Runs tab ──────────────────────────────────────────── */}
        {activeTab === 'runs' && (
          <>
            {/* Last run result (if just ran) */}
            {lastRunResult && (
              <FoundationCard
                title="Latest Run"
                description={`${lastRunResult.summary.total} scenarios · ${lastRunResult.summary.passed} passed · ${lastRunResult.summary.failed} failed`}
              >
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', marginBottom: 'var(--Spacing-4)' }}>
                  <Badge attention="medium" appearance="neutral" size="m">
                    Average: {lastRunResult.summary.averageScore}/100
                  </Badge>
                  <Badge
                    attention="medium"
                    appearance={lastRunResult.summary.failed === 0 ? 'positive' : 'negative'}
                    size="m"
                  >
                    {lastRunResult.summary.failed === 0 ? 'All passed' : `${lastRunResult.summary.failed} failed`}
                  </Badge>
                </div>
                <div className={styles.propertyList}>
                  {lastRunResult.results.map((result: any) => (
                    <ScenarioResultRow key={result.scenarioId} result={result} />
                  ))}
                </div>
              </FoundationCard>
            )}

            {/* Historical runs from Convex */}
            {runs && runs.length > 0 && runs.map((run: any) => (
              <FoundationCard
                key={run._id}
                title={run.name || `Run ${new Date(run.createdAt).toLocaleDateString()}`}
                description={`${run.totalScenarios} scenarios · ${run.passCount} passed · ${run.failCount} failed · Average: ${run.averageScore}`}
                collapsible
                defaultCollapsed
                actions={
                  <Badge
                    attention="medium"
                    appearance={run.status === 'completed' ? 'positive' : run.status === 'failed' ? 'negative' : 'informative'}
                    size="m"
                  >
                    {run.status}
                  </Badge>
                }
              >
                <div className={styles.propertyList}>
                  {run.results.map((result: any) => (
                    <div key={result.scenarioId} className={styles.propertyRow}>
                      <span className={styles.propertyLabel}>{result.scenarioId}</span>
                      <Badge
                        attention="medium"
                        appearance={result.passed ? 'positive' : 'negative'}
                        size="s"
                      >
                        {result.score}/100
                      </Badge>
                    </div>
                  ))}
                </div>
              </FoundationCard>
            ))}

            {(!runs || runs.length === 0) && !lastRunResult && (
              <FoundationCard
                title="No evaluation runs yet"
                description="Run your first evaluation from the Scenarios tab to see results here."
              >
                <Button attention="medium" appearance="primary" size="s" onPress={() => setActiveTab('scenarios')}>
                  Go to Scenarios
                </Button>
              </FoundationCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Per-scenario row in the "Latest run" panel. Extracted so each row owns
 * its own "show trace" toggle — a single shared boolean would expand every
 * row at once, which defeats the purpose when comparing runs.
 */
function ScenarioResultRow({ result }: { result: any }) {
  const [open, setOpen] = useState(false);
  const hasTrace = Boolean(result.retrievalTrace);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
      <div className={styles.propertyRow}>
        <span className={styles.propertyLabel}>{result.scenarioId}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Badge
            attention="medium"
            appearance={result.passed ? 'positive' : 'negative'}
            size="s"
          >
            {result.score}/100
          </Badge>
          {result.notes && (
            <span style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))' }}>
              {result.notes}
            </span>
          )}
          {hasTrace && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: 'var(--Text-Medium)',
                fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                fontSize: 'var(--Label-XS-FontSize)',
                lineHeight: 'var(--Label-XS-LineHeight)',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              {open ? 'Hide trace' : 'Retrieval trace'}
            </button>
          )}
        </div>
      </div>
      {hasTrace && open && (
        <RetrievalTracePanel
          trace={result.retrievalTrace}
          promptSize={result.promptSize}
          compact
        />
      )}
    </div>
  );
}
