/**
 * (platform)/page.tsx — Home landing
 *
 * Prompt-first entry point. Delegates to `<HomeChat>`, which owns the
 * useChat wiring, brand summary extraction, and opportunistic Convex
 * persistence.
 *
 * This page starts with no `initialThreadId` / `initialMessages` — the
 * user is beginning a fresh conversation. The first exchange is created
 * as a new thread after the assistant stream settles.
 */

'use client';

import React from 'react';
import { HomeChat } from '@/components/HomeChat';

export default function HomePage() {
  return <HomeChat />;
}
