/**
 * ExperienceLabShell.tsx — the chat-first Lab layout (D-13).
 *
 * A CSS-grid split: a LEFT chat pane (`ExperienceLabChat`, D-01) and a RIGHT
 * canvas pane (the isolated tldraw `ExperienceLabCanvas`, D-02 placement
 * preserved). Both docks (RequestPanel / RunInspectorPanel) are retired (D-13).
 *
 * Canvas → chat placement seam (D-12), LOCKED with no ambiguity:
 *   1. The canvas mounts and hands its `Editor` up via `onEditorMount`.
 *   2. The shell derives `canvasCallbacks` ({ placeArtifact, flipToGapState })
 *      from `useExperienceLabRun(editor)`.
 *   3. The shell threads `canvasCallbacks` DOWN into `ExperienceLabChat`, which
 *      forwards it into `useLabConversation`.
 *   4. On a terminal run frame, `useLabConversation` is the SINGLE caller of the
 *      canvas placement — `placeArtifact(...)` for an artifact, `flipToGapState`
 *      for a real gap. There is no "canvas-calls-the-hook" path.
 *
 * The canvas keeps its `ssr:false` dynamic import + `PageLoader` fallback; only
 * the `Editor` ref is lifted up to the shell so the chat pane can receive the
 * callbacks. The shell is `'use client'`.
 *
 * Isolation: all `@oneui/ui` imports use the deep `@oneui/ui-internal/*` alias;
 * no `(builder)` / `ExperienceCanvas` import; no `ai` / `@ai-sdk` import.
 */

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Editor } from 'tldraw';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import { PageLoader } from '@/components/PageLoader';
import { ExperienceLabChat } from '../_chat/ExperienceLabChat';
import { useExperienceLabRun } from '../_canvas/useExperienceLabRun';
import styles from './ExperienceLabShell.module.css';

// tldraw needs browser APIs — keep the canvas as an ssr:false dynamic import
// with a PageLoader fallback (preserved from the previous lab/page.tsx posture).
const ExperienceLabCanvas = dynamic(() => import('../_canvas/ExperienceLabCanvas'), {
  ssr: false,
  loading: () => <PageLoader />,
});

export default function ExperienceLabShell() {
  // The canvas hands its Editor up on mount so the shell can derive the canvas
  // placement callbacks and thread them to the chat (D-12).
  const [editor, setEditor] = useState<Editor | null>(null);
  const { canvasCallbacks } = useExperienceLabRun(editor);

  return (
    <div className={styles.shell} data-testid="experience-lab-shell">
      <Surface mode="default" className={styles.chatPane}>
        <ExperienceLabChat canvasCallbacks={canvasCallbacks} editor={editor} />
      </Surface>
      <Surface mode="default" className={styles.canvasPane}>
        <ExperienceLabCanvas onEditorMount={setEditor} />
      </Surface>
    </div>
  );
}
