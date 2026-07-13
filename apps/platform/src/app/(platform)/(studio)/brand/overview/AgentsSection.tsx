/**
 * brand/overview/AgentsSection.tsx
 *
 * Per-brand agent status: one row per agent (Design Composition, Tone of
 * Voice) showing whether the brand has a config persisted. Click → that
 * agent's editor. Section header "View all" → /agents hub.
 */

'use client';

import React from 'react';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/icons/Icon';
import type { SemanticIconName } from '@oneui/shared';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';
import styles from './page.module.css';

const ICON_SIZE = 20;

interface AgentsSectionProps {
  compositionConfigured: boolean;
  voiceConfigured: boolean;
}

export const AgentsSection = React.memo(function AgentsSection({
  compositionConfigured,
  voiceConfigured,
}: AgentsSectionProps) {
  const { handleNavigate } = usePlatformNavigation();
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Agents</h2>
        <Button
          contained={false}
          attention="low"
          appearance="primary"
          size="s"
          onPress={() => handleNavigate('/agents')}
        >
          View all
        </Button>
      </div>
      <div className={styles.selectionList}>
        <AgentRow
          icon="sparkles"
          label="Design Composition"
          isConfigured={compositionConfigured}
          href="/agents/design-composition"
        />
        <AgentRow
          icon="chat"
          label="Tone of Voice"
          isConfigured={voiceConfigured}
          href="/agents/tone-of-voice"
        />
      </div>
    </section>
  );
});

interface AgentRowProps {
  icon: SemanticIconName;
  label: string;
  isConfigured: boolean;
  href: string;
}

function AgentRow({ icon, label, isConfigured, href }: AgentRowProps) {
  const { handleNavigate } = usePlatformNavigation();
  // Plain button, not <Button> — Button wraps children in its own label span,
  // which breaks the row's flex layout (see FoundationSelections.SelectionRow).
  return (
    <button type="button" className={styles.selectionRow} onClick={() => handleNavigate(href)}>
      <span className={styles.selectionRowIcon}>
        <Icon name={icon} size={ICON_SIZE} aria-hidden />
      </span>
      <span className={styles.selectionLabel}>{label}</span>
      <span className={styles.selectionBadgeCol}>
        {!isConfigured && (
          <Badge attention="medium" size="s" appearance="negative">
            Not configured
          </Badge>
        )}
      </span>
      <span className={styles.selectionPreview} />
    </button>
  );
}
