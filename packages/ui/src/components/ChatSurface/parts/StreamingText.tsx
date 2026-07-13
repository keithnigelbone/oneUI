/**
 * StreamingText.tsx
 *
 * Renders assistant text with a gentle per-segment fade-in so streamed
 * responses feel like the agent is writing, not pasting. Segments are
 * keyed by index so already-mounted words never re-animate when new
 * tokens arrive — the server's token cadence provides the rhythm.
 *
 * Messages that were not streamed in this mount (history replay) skip
 * the animation entirely via the `animateInitial` ref guard.
 */

'use client';

import React, { useMemo, useRef } from 'react';
import styles from './StreamingText.module.css';

export interface StreamingTextProps {
  text: string;
  /** True when this specific message is actively streaming. */
  isStreaming: boolean;
}

/**
 * Split text into non-empty word + whitespace segments so whitespace is
 * preserved exactly. Each element becomes an independently-animated span.
 */
function splitSegments(text: string): string[] {
  if (!text) return [];
  // Match runs of whitespace OR runs of non-whitespace.
  return text.match(/\s+|\S+/g) ?? [];
}

export function StreamingText({ text, isStreaming }: StreamingTextProps) {
  // Lock animation on first render: if the message mounted already
  // complete (history replay), never animate. Only animate when the
  // message was mid-stream at mount.
  const animateRef = useRef<boolean | null>(null);
  if (animateRef.current === null) {
    animateRef.current = isStreaming;
  }
  const shouldAnimate = animateRef.current;

  const segments = useMemo(() => splitSegments(text), [text]);

  if (!shouldAnimate) {
    return <>{text}</>;
  }

  return (
    <span className={styles.root}>
      {segments.map((seg, i) => (
        <span key={i} className={styles.segment}>
          {seg}
        </span>
      ))}
    </span>
  );
}
