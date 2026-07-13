'use client';

import { useMemo, useState, useCallback } from 'react';
import { Unplug, PlugZap, ExternalLink, GitCompareArrows, Search, Check } from 'lucide-react';
import type {
  ParityEntry,
  ParitySummary,
  SpacingParityMatrix as SpacingParityMatrixType,
  ComponentTokenManifest,
} from '@oneui/shared';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import type { SelectOption } from '@oneui/ui-internal/components/Select/Select';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { InputField as Input } from '@oneui/ui-internal/components/InputField/InputField';
import { CollapsibleSection } from '../ComponentTokenEditor/AdvancedEditor/CollapsibleSection';
import { ParitySummaryBar } from './ParitySummaryBar';
import { ParityTokenTable } from './ParityTokenTable';
import { SpacingParityMatrix } from './SpacingParityMatrix';
import styles from './ParityDashboard.module.css';

export interface FigmaConnectionInfo {
  status: 'active' | 'expired' | 'revoked' | 'disconnected';
  fileKey?: string;
  fileName?: string;
  lastSyncedAt?: number;
  tokenCount?: number;
}

export interface ParityDashboardProps {
  /** Component token manifest — used to auto-populate tool-side tokens */
  manifest?: ComponentTokenManifest;
  /** Parity entries from a completed check (overrides auto-generated entries) */
  entries?: ParityEntry[];
  /** Parity summary (computed from entries if not provided) */
  summary?: ParitySummary;
  /** Spacing matrix for grid view */
  spacingMatrix?: SpacingParityMatrixType;
  /** Whether live Figma connection is active */
  isLive?: boolean;
  /** Whether a check is in progress */
  isChecking?: boolean;
  /** Timestamp of last check */
  lastCheckedAt?: number;
  /** Trigger a parity check against a specific Figma component node */
  onRunCheck?: (nodeId: string) => void;
  /** Entry row clicked */
  onSelectEntry?: (entry: ParityEntry) => void;
  /** Figma connection info for the current brand */
  figmaConnection?: FigmaConnectionInfo | null;
  /** Navigate to Figma settings */
  onOpenFigmaSettings?: () => void;
  /** Persisted Figma node ID for the component */
  figmaNodeId?: string;
  /** Callback when node ID changes */
  onNodeIdChange?: (nodeId: string) => void;
  /** Error message from last check */
  checkError?: string | null;
}

/**
 * Build parity entries from a component manifest (tool-side only).
 */
function buildManifestEntries(
  manifest: ComponentTokenManifest,
  hasFigmaData: boolean,
): ParityEntry[] {
  const entries: ParityEntry[] = [];

  for (const [propertyName, def] of Object.entries(manifest.tokens)) {
    const slot = propertyName.endsWith('Start')
      ? 'start'
      : propertyName.endsWith('End')
        ? 'end'
        : undefined;

    if (def.sizes && Object.keys(def.sizes).length > 0) {
      for (const [size, tokenValue] of Object.entries(def.sizes)) {
        entries.push({
          cssTokenName: tokenValue,
          category: def.category,
          status: hasFigmaData ? 'missing-in-figma' : 'unmapped',
          toolValue: tokenValue,
          tokenProperty: propertyName,
          size,
          slot,
        });
      }
    } else {
      entries.push({
        cssTokenName: def.defaultToken,
        category: def.category,
        status: hasFigmaData ? 'missing-in-figma' : 'unmapped',
        toolValue: def.defaultToken,
        tokenProperty: propertyName,
        slot,
      });
    }
  }

  return entries;
}

function computeSummary(entries: ParityEntry[]): ParitySummary {
  const summary: ParitySummary = {
    matched: 0, mismatched: 0, missingInFigma: 0,
    missingInTool: 0, unmapped: 0, total: entries.length,
  };
  for (const e of entries) {
    if (e.status === 'matched') summary.matched++;
    else if (e.status === 'mismatched') summary.mismatched++;
    else if (e.status === 'missing-in-figma') summary.missingInFigma++;
    else if (e.status === 'missing-in-tool') summary.missingInTool++;
    else if (e.status === 'unmapped') summary.unmapped++;
  }
  return summary;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Extract a Figma node ID from either a raw ID ("123:456") or a full Figma URL.
 * Returns the normalized node ID (colon-separated) or null if invalid.
 */
function parseFigmaNodeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Raw node ID: "123:456" or "123-456"
  const rawMatch = trimmed.match(/^(\d+)[:\-](\d+)$/);
  if (rawMatch) return `${rawMatch[1]}:${rawMatch[2]}`;

  // Full Figma URL: extract node-id query param
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes('figma.com')) return null;
    const nodeIdParam = url.searchParams.get('node-id');
    if (nodeIdParam) {
      const paramMatch = nodeIdParam.match(/^(\d+)[:\-](\d+)$/);
      if (paramMatch) return `${paramMatch[1]}:${paramMatch[2]}`;
    }
  } catch {
    // Not a URL — fall through
  }

  return null;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'matched', label: 'Matched' },
  { value: 'mismatched', label: 'Mismatched' },
  { value: 'missing-in-figma', label: 'Missing in Figma' },
  { value: 'missing-in-tool', label: 'Missing in Tool' },
  { value: 'unmapped', label: 'Unmapped' },
];

export function ParityDashboard({
  manifest,
  entries: externalEntries,
  summary: externalSummary,
  spacingMatrix,
  isLive = false,
  isChecking = false,
  lastCheckedAt,
  onRunCheck,
  onSelectEntry,
  figmaConnection,
  onOpenFigmaSettings,
  figmaNodeId,
  onNodeIdChange,
  checkError,
}: ParityDashboardProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [localNodeId, setLocalNodeId] = useState(figmaNodeId ?? '');

  const hasFigmaData = figmaConnection?.status === 'active' && (figmaConnection.tokenCount ?? 0) > 0;

  const parsedNodeId = parseFigmaNodeId(localNodeId);
  const isNodeIdValid = parsedNodeId !== null;
  const nodeIdError = localNodeId.trim().length > 0 && !isNodeIdValid
    ? 'Paste a Figma URL or node ID (e.g. 123:456)'
    : undefined;

  const handleRunCheck = useCallback(() => {
    if (!parsedNodeId || !onRunCheck) return;
    // Persist the parsed node ID
    if (onNodeIdChange && parsedNodeId !== figmaNodeId) {
      onNodeIdChange(parsedNodeId);
    }
    onRunCheck(parsedNodeId);
  }, [parsedNodeId, onRunCheck, onNodeIdChange, figmaNodeId]);

  // Auto-generate entries from manifest if no external entries provided
  const entries = useMemo(() => {
    if (externalEntries && externalEntries.length > 0) return externalEntries;
    if (manifest) return buildManifestEntries(manifest, hasFigmaData);
    return [];
  }, [externalEntries, manifest, hasFigmaData]);

  const summary = useMemo(() => {
    if (externalSummary) return externalSummary;
    return computeSummary(entries);
  }, [externalSummary, entries]);

  const categoryOptions: SelectOption[] = useMemo(() => {
    const cats = new Set<string>();
    for (const entry of entries) cats.add(entry.category);
    return [
      { value: '', label: 'All categories' },
      ...Array.from(cats).sort().map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
    ];
  }, [entries]);

  const showSpacingMatrix = categoryFilter === 'spacing' && spacingMatrix != null;
  const isConnected = figmaConnection?.status === 'active';
  const hasNodeId = isNodeIdValid;

  return (
    <div className={styles.dashboard}>
      {/* Figma Connection Section */}
      <CollapsibleSection
        title="Figma Connection"
        icon={<GitCompareArrows size={10} />}
        defaultOpen={!isConnected || !hasNodeId}
      >
        <div className={styles.connectionCard} data-connected={isConnected}>
          <div className={styles.connectionHeader}>
            <span className={styles.connectionIcon}>
              {isConnected ? <PlugZap size={14} /> : <Unplug size={14} />}
            </span>
            <div className={styles.connectionInfo}>
              <span className={styles.connectionTitle}>
                {isLive
                  ? 'Live — Figma Desktop'
                  : isConnected
                    ? figmaConnection.fileName ?? 'Connected'
                    : 'Not connected'}
              </span>
              {isConnected && figmaConnection.fileKey && (
                <span className={styles.connectionDetail}>
                  {figmaConnection.fileKey}
                </span>
              )}
            </div>
            {isLive && <span className={styles.livePulse} />}
          </div>

          {/* Connection details */}
          {isConnected && (
            <div className={styles.connectionMeta}>
              {figmaConnection.lastSyncedAt && (
                <span className={styles.metaItem}>
                  Synced {formatRelativeTime(figmaConnection.lastSyncedAt)}
                </span>
              )}
              {figmaConnection.tokenCount != null && (
                <span className={styles.metaItem}>
                  {figmaConnection.tokenCount} Figma tokens
                </span>
              )}
            </div>
          )}

          {/* Component Node ID — always visible so users can configure before connecting */}
          <Input
            label="Figma Component"
            placeholder="Paste Figma URL or node ID (e.g. 123:456)"
            value={localNodeId}
            onChange={setLocalNodeId}
            size="s"
            invalid={!!nodeIdError}
            error={nodeIdError}
            description="Right-click a component in Figma → Copy/Paste → Copy link"
            end={isNodeIdValid ? <Check size={14} className={styles.validIcon} /> : undefined}
          />

          {/* Error message */}
          {checkError && (
            <div className={styles.errorMessage}>{checkError}</div>
          )}

          {/* Actions */}
          <div className={styles.connectionActions}>
            {onRunCheck && (
              <Button
                attention="high"
                size={8}
                loading={isChecking}
                disabled={!hasNodeId}
                onPress={handleRunCheck}
                leftIcon={<Search size={12} />}
              >
                {isChecking ? 'Scanning' : 'Scan Component'}
              </Button>
            )}
            {onOpenFigmaSettings && (
              <Button
                attention="low"
                size={8}
                onPress={onOpenFigmaSettings}
                leftIcon={<ExternalLink size={12} />}
              >
                {isConnected ? 'Settings' : 'Connect Figma'}
              </Button>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Results Section */}
      <CollapsibleSection
        title="Token Comparison"
        icon={<GitCompareArrows size={10} />}
        count={entries.length}
        defaultOpen
      >
        {/* Summary pills */}
        {entries.length > 0 && (
          <ParitySummaryBar
            summary={summary}
            isLive={isLive}
            lastCheckedAt={lastCheckedAt}
          />
        )}

        {/* Filters */}
        {entries.length > 0 && (
          <div className={styles.filterRow}>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categoryOptions}
              size="sm"
              aria-label="Filter by category"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              size="sm"
              aria-label="Filter by status"
            />
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          {isChecking && (
            <div className={styles.loadingOverlay}>
              <span className={styles.loadingText}>Scanning Figma component…</span>
            </div>
          )}

          {showSpacingMatrix ? (
            <SpacingParityMatrix matrix={spacingMatrix} />
          ) : (
            <ParityTokenTable
              entries={entries}
              onSelectEntry={onSelectEntry}
              categoryFilter={categoryFilter || undefined}
              statusFilter={(statusFilter || undefined) as ParityEntry['status'] | undefined}
            />
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
