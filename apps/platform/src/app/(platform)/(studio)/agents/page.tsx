/**
 * Agents hub — lists live sub-agents (Tone of Voice) and coming-soon
 * placeholders. Built with OneUI components only — icons resolve from
 * the active brand's selected icon set.
 */

'use client';

import React from 'react';
import { IconContained } from '@oneui/ui/components/IconContained';
import { Badge } from '@oneui/ui/components/Badge';
import type { SemanticIconName } from '@oneui/shared';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';
import styles from './page.module.css';

interface AgentCard {
  id: string;
  name: string;
  description: string;
  /** Semantic icon name — resolved from the active brand's icon set at render time. */
  icon: SemanticIconName;
  /** Where the card routes when clicked. Null when the agent is not live yet. */
  href: string | null;
  status: 'active' | 'coming-soon';
  /** Short contextual tags shown in the card footer. */
  tags: string[];
}

const AGENTS: AgentCard[] = [
  {
    id: 'tone-of-voice',
    name: 'Tone of Voice',
    description:
      "Compiles your brand's voice rules into a system prompt and runs a deterministic tone guard on every generation.",
    icon: 'chat',
    href: '/agents/tone-of-voice',
    status: 'active',
    tags: ['voice rules', 'tone guard', 'channels'],
  },
  {
    id: 'design-composition',
    name: 'Design Composition',
    description:
      'Generates UI compositions from modular rules, validates against brand foundations, and continuously improves via designer feedback.',
    icon: 'palette',
    href: '/agents/design-composition',
    status: 'active',
    tags: ['composition', 'rules', 'validation', 'playground'],
  },
  {
    id: 'image-generation',
    name: 'Image Generation',
    description:
      'Generates on-brand imagery and marketing assets constrained by your color scales, typography, and composition rules.',
    icon: 'image',
    href: null,
    status: 'coming-soon',
    tags: ['visuals', 'brand palette', 'assets'],
  },
  {
    id: 'code-quality',
    name: 'Code Quality',
    description:
      'Reviews component code for token compliance, accessibility, and design system conventions. Flags literals, missing focus rings, and more.',
    icon: 'components',
    href: null,
    status: 'coming-soon',
    tags: ['linting', 'a11y', 'token compliance'],
  },
];

export default function AgentsHubPage() {
  const { handleNavigate } = usePlatformNavigation();

  const handleCardClick = (card: AgentCard) => {
    if (card.href) handleNavigate(card.href);
  };

  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    card: AgentCard,
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(card);
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Agents</h1>
        <p className={styles.subtitle}>
          Specialised sub-agents that extend the global One UI Studio assistant. Each
          agent layers domain-specific context — tone rules, composition recipes,
          design history — on top of the shared knowledge base so answers stay
          grounded in your brand.
        </p>
      </header>

      <section>
        <p className={styles.sectionLabel}>Available</p>
        <div className={styles.grid}>
          {AGENTS.filter((a) => a.status === 'active').map((card) => (
            <AgentCardView
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => handleCardKeyDown(e, card)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className={styles.sectionLabel}>Coming soon</p>
        <div className={styles.grid}>
          {AGENTS.filter((a) => a.status === 'coming-soon').map((card) => (
            <AgentCardView
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => handleCardKeyDown(e, card)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function AgentCardView({
  card,
  onClick,
  onKeyDown,
}: {
  card: AgentCard;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const disabled = card.href === null;
  return (
    <button
      type="button"
      className={styles.card}
      data-disabled={disabled ? 'true' : undefined}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
    >
      <div className={styles.cardHeader}>
        <IconContained icon={card.icon} attention="high" size="l" aria-hidden="true" />
        <Badge
          attention="medium"
          size="s"
          appearance={card.status === 'active' ? 'positive' : 'neutral'}
        >
          {card.status === 'active' ? 'Active' : 'Coming soon'}
        </Badge>
      </div>
      <h3 className={styles.name}>{card.name}</h3>
      <p className={styles.description}>{card.description}</p>
      {card.tags.length > 0 && (
        <div className={styles.meta}>
          {/* Badge (span) not Chip (button) — the card itself is a <button>
              and nested buttons cause a React hydration mismatch. */}
          {card.tags.map((tag) => (
            <Badge
              key={tag}
              attention="low"
              size="s"
              appearance="neutral"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </button>
  );
}
