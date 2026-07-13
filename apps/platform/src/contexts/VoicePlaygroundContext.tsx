/**
 * VoicePlaygroundContext.tsx
 *
 * Shares voice playground state (context, channel, toneGuard toggle) between
 * the TopBar controls and the playground page.
 *
 * Two orthogonal axes control the compiled prompt:
 *   - context: surface type (conversational / copy / microcopy / editorial)
 *   - channel: delivery channel (default / sms / whatsapp / app / ivr / email)
 *
 * Channel only affects compilation when context === 'conversational'.
 */

'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { VoiceContext } from '@oneui/shared/engine';

interface VoicePlaygroundState {
  context: VoiceContext;
  setContext: (context: VoiceContext) => void;
  channel: string;
  setChannel: (channel: string) => void;
  showToneGuard: boolean;
  setShowToneGuard: (show: boolean) => void;
}

const VoicePlaygroundContext = createContext<VoicePlaygroundState | null>(null);

export function VoicePlaygroundProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<VoiceContext>('conversational');
  const [channel, setChannel] = useState('default');
  const [showToneGuard, setShowToneGuard] = useState(true);

  return (
    <VoicePlaygroundContext.Provider
      value={{ context, setContext, channel, setChannel, showToneGuard, setShowToneGuard }}
    >
      {children}
    </VoicePlaygroundContext.Provider>
  );
}

export function useVoicePlayground() {
  const ctx = useContext(VoicePlaygroundContext);
  if (!ctx) throw new Error('useVoicePlayground must be used within VoicePlaygroundProvider');
  return ctx;
}

export function useVoicePlaygroundOptional() {
  return useContext(VoicePlaygroundContext);
}
