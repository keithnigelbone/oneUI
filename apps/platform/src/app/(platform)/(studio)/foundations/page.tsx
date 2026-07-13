/**
 * foundations/page.tsx
 *
 * Redirect to color foundation (default tab)
 */

import { redirect } from 'next/navigation';

export default function FoundationsPage() {
  redirect('/foundations/color');
}
