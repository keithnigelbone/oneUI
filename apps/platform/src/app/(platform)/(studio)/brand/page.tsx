/**
 * brand/page.tsx
 *
 * Brand Configuration index page - redirects to overview
 */

import { redirect } from 'next/navigation';

export default function BrandPage() {
  redirect('/brand/overview');
}
