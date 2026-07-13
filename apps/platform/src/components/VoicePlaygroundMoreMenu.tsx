/**
 * VoicePlaygroundMoreMenu.tsx
 *
 * Subtle kebab ("more") menu rendered in the TopBar's right slot when
 * the user is on the Voice playground. Opens a compact popover that
 * hosts the three playground-specific settings — voice context
 * (conversational / copy / microcopy / editorial), delivery channel
 * (conversational only), and the tone guard toggle — so the header
 * chrome stays minimal while the controls remain one click away.
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Switch } from '@oneui/ui/components/Switch';
import { useVoicePlaygroundOptional } from '@/contexts/VoicePlaygroundContext';
import type { VoiceContext } from '@oneui/shared/engine';
import styles from './VoicePlaygroundMoreMenu.module.css';

interface Option<V extends string> {
  value: V;
  label: string;
}

const CONTEXT_OPTIONS: Option<VoiceContext>[] = [
  { value: 'conversational', label: 'Chat' },
  { value: 'copy', label: 'Copy' },
  { value: 'microcopy', label: 'Microcopy' },
  { value: 'editorial', label: 'Editorial' },
];

const CHANNEL_OPTIONS: Option<string>[] = [
  { value: 'default', label: 'Default' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'app', label: 'App' },
  { value: 'ivr', label: 'IVR' },
  { value: 'email', label: 'Email' },
];

function KebabIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function VoicePlaygroundMoreMenu() {
  const ctx = useVoicePlaygroundOptional();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') setOpen(false);
  }, []);

  if (!ctx) return null;
  const { context, setContext, channel, setChannel, showToneGuard, setShowToneGuard } = ctx;
  const isChatContext = context === 'conversational';

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-label="Voice playground options"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <KebabIcon />
      </button>

      {open && (
        <div className={styles.popover} role="menu">
          <div className={styles.row}>
            <label className={styles.label} htmlFor="vpmore-context">
              Context
            </label>
            <select
              id="vpmore-context"
              className={styles.select}
              value={context}
              onChange={(e) => setContext(e.target.value as VoiceContext)}
            >
              {CONTEXT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {isChatContext && (
            <div className={styles.row}>
              <label className={styles.label} htmlFor="vpmore-channel">
                Channel
              </label>
              <select
                id="vpmore-channel"
                className={styles.select}
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                {CHANNEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.row}>
            <span className={styles.label}>Tone guard</span>
            <Switch checked={showToneGuard} onCheckedChange={setShowToneGuard} size="s" />
          </div>
        </div>
      )}
    </div>
  );
}
