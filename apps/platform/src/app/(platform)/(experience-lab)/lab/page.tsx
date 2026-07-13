/**
 * (experience-lab)/lab/page.tsx
 *
 * Entry page for the isolated Experience Lab, served at `/lab` (a dedicated
 * segment so it never collides with the platform home `/`). The chat-first shell
 * (D-13) is the left chat + right canvas split; it owns the `ssr:false` dynamic
 * canvas import + `PageLoader` fallback (tldraw needs browser APIs), so this page
 * only renders the `'use client'` shell.
 *
 * Isolation (LAB-03): this page only knows about the sibling
 * `_shell/ExperienceLabShell` — it never touches `ExperienceCanvas` or the
 * `(builder)` route group.
 */

'use client';

import ExperienceLabShell from '../_shell/ExperienceLabShell';

export default function ExperienceLabPage() {
  return <ExperienceLabShell />;
}
