/**
 * AgentThinking.tsx
 *
 * Shared "agent is thinking" indicator for every chat surface. Renders the
 * design-system `AgentPulse` — an animated brand-coloured indicator that
 * morphs the OneUI logo geometry through the agent's state (currently
 * `thinking`; future surfaces can drive `listening` / `speaking` too).
 * Recolours per brand at runtime and adapts on coloured surfaces.
 *
 * When the caller provides `messages`, the indicator also renders a
 * rotating status line — one phrase at a time, fading/sliding between
 * them — so a long-running generation reads as live progress rather
 * than dead air.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { AgentPulse } from '../../AgentPulse/AgentPulse';
import type { AgentPulseState } from '../../AgentPulse/AgentPulse.shared';
import styles from './AgentThinking.module.css';

export interface AgentThinkingProps {
  /**
   * Optional decorative icon. Retained for API compatibility with earlier
   * chat surfaces that supplied a brand icon (`<IcHellojio />` etc.); the
   * AgentPulse now provides the visual identity, so the prop is ignored
   * for rendering. Callers can drop it from new code.
   */
  icon?: React.ReactNode;
  /**
   * Pulse state. Defaults to `'thinking'` — the indicator only renders
   * during streaming, but surfaces driving a richer FSM (voice agents)
   * can pass `'listening'` or `'speaking'` instead.
   */
  state?: AgentPulseState;
  /**
   * Optional rotating status messages. When provided, the indicator
   * cycles through each phrase on a fixed cadence with a smooth fade/
   * slide animation. Useful for surfaces with long generation phases —
   * the user keeps a sense of what the agent is doing instead of
   * staring at a silent spinner.
   */
  messages?: ReadonlyArray<string>;
  /** Time per message in ms. Defaults to 2400. */
  rotateMs?: number;
}

export function AgentThinking({
  state = 'thinking',
  messages,
  rotateMs = 2400,
}: AgentThinkingProps) {
  return (
    <div className={styles.root} aria-label="Assistant is thinking" role="status">
      <AgentPulse state={state} appearance="primary" size="lg" aria-live="off" />
      {messages && messages.length > 0 ? (
        <StatusRotator messages={messages} rotateMs={rotateMs} />
      ) : null}
    </div>
  );
}

interface StatusRotatorProps {
  messages: ReadonlyArray<string>;
  rotateMs: number;
}

function StatusRotator({ messages, rotateMs }: StatusRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, rotateMs);
    return () => window.clearInterval(id);
  }, [messages.length, rotateMs]);

  // `key` forces a remount on each tick so the CSS animation replays.
  return (
    <span className={styles.statusTrack} aria-live="polite">
      <span key={index} className={styles.statusText}>
        {messages[index]}
      </span>
    </span>
  );
}
