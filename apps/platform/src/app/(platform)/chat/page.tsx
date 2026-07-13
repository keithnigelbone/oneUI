/**
 * chat/page.tsx — History landing
 *
 * Reached when the user clicks "History" in the Home mode left nav.
 * Past threads are listed in the secondary nav; this page provides the
 * empty-state canvas for when no thread has been selected yet.
 */

'use client';

import React from 'react';
import { Button } from '@oneui/ui/components/Button';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';

export default function ChatIndexPage() {
  const { handleNavigate } = usePlatformNavigation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--Spacing-4)',
        padding: 'var(--Spacing-9)',
        textAlign: 'center',
        height: '100%',
        minHeight: '60vh',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
          fontSize: 'var(--Body-M-FontSize)',
          lineHeight: 'var(--Body-M-LineHeight)',
          color: 'var(--Primary-Medium-Text)',
          margin: 0,
          maxWidth: 320,
         }}
      >
        Select a conversation from the history panel, or start a new one.
      </p>
      <Button attention="high" onPress={() => handleNavigate('/')}>
        New chat
      </Button>
    </div>
  );
}
