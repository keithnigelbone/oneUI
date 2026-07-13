/**
 * StartHereContent — default landing for the Create section.
 *
 * Shows a chat interface directly. On first message:
 *  - Auto-creates a Convex project (named from the message or "Untitled project")
 *  - Stores the first message payload in sessionStorage so ProjectWorkspace picks it up
 *  - Navigates to /create/projects/{id}
 *
 * In offline mode the wizard bootstraps immediately (no user prompt required).
 */

'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { generateId, type UIMessage } from 'ai';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { Button } from '@oneui/ui/components/Button';
import { CreateChatPanel } from '../components/CreateChatPanel';
import { CreateChatActionsContext } from '../components/CreateChatContext';
import {
  checkCreateChatApiAvailable,
  createInitialOfflineWizardState,
  getOfflineWizardBootstrapMessages,
  processOfflineWizardTurn,
  type OfflineWizardContext,
} from '../lib/offline-wizard-engine';
import type { SocialPlatform } from '../lib/types';
import styles from './StartHereContent.module.css';

const DEFAULT_PROJECT_NAME = 'Quick project';

function deriveProjectName(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return DEFAULT_PROJECT_NAME;
  const capped = trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed;
  return capped;
}

const SUGGESTED_PROMPTS = [
  'Create a bold Instagram post for a product launch',
  'Design a LinkedIn banner for a tech event',
  'Make a set of social ads for a sale campaign',
  'Generate a YouTube thumbnail with a hero image',
];

export default function StartHereContent() {
  const { currentBrand } = usePlatformContext();
  const router = useRouter();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const createProject = useMutation(api.createProjects.create);

  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Offline mode
  const apiModeRef = useRef<'unknown' | 'online' | 'offline'>('unknown');
  const offlineWizardStateRef = useRef(createInitialOfflineWizardState());
  const [isOffline, setIsOffline] = useState(false);
  const [offlineMessages, setOfflineMessages] = useState<UIMessage[]>([]);
  const offlineProjectIdRef = useRef<string | null>(null);
  const offlineBootstrapped = useRef(false);

  const offlineWizardContext = useMemo((): OfflineWizardContext => ({
    projectName: DEFAULT_PROJECT_NAME,
    projectType: 'single',
    projectPlatforms: [],
  }), []);

  // Offline auto-bootstrap: probe API on mount; if offline, show wizard immediately
  useEffect(() => {
    if (apiModeRef.current !== 'unknown' || offlineBootstrapped.current) return;
    let cancelled = false;

    checkCreateChatApiAvailable().then((ok) => {
      if (cancelled) return;
      if (ok) {
        apiModeRef.current = 'online';
        return;
      }
      apiModeRef.current = 'offline';
      offlineBootstrapped.current = true;
      setIsOffline(true);
      setOfflineMessages(getOfflineWizardBootstrapMessages(offlineWizardContext));
    });

    return () => { cancelled = true; };
  }, [offlineWizardContext]);

  const createProjectAndNavigate = useCallback(
    async (
      text: string,
      attachments?: { name: string; type: string; dataUrl: string }[]
    ) => {
      if (!brandId || isCreating) return;
      setIsCreating(true);
      setErrorMessage(null);
      try {
        const projectId = await createProject({
          brandId,
          name: deriveProjectName(text),
          type: 'single',
          platforms: ['instagram'] as SocialPlatform[],
        });

        // Stash the first message so ProjectWorkspace sends it on mount
        try {
          sessionStorage.setItem(
            `create-pending-message:${projectId}`,
            JSON.stringify({ text, attachments })
          );
        } catch { /* storage full — ProjectWorkspace starts with empty chat */ }

        router.push(`/create/projects/${projectId}`);
      } catch (err) {
        console.error('Failed to create project:', err);
        setErrorMessage('Failed to create project. Please try again.');
        setIsCreating(false);
      }
    },
    [brandId, createProject, isCreating, router]
  );

  const saveOfflineProjectIfComplete = useCallback(
    (nextState: ReturnType<typeof createInitialOfflineWizardState>, allMessages: UIMessage[]) => {
      if (nextState.internalStep !== 'complete' || !brandId || offlineProjectIdRef.current) return;
      offlineProjectIdRef.current = 'pending';

      createProject({
        brandId,
        name: DEFAULT_PROJECT_NAME,
        type: nextState.selectedDimensions && nextState.selectedDimensions.length > 1
          ? 'campaign' as const
          : 'single' as const,
        platforms: nextState.socialPlatform ? [nextState.socialPlatform] : ['instagram'] as SocialPlatform[],
      }).then((projectId) => {
        offlineProjectIdRef.current = projectId;
        try {
          sessionStorage.setItem(
            `create-start-here-messages:${projectId}`,
            JSON.stringify(allMessages)
          );
        } catch { /* storage full */ }
        router.push(`/create/projects/${projectId}`);
      }).catch((err) => {
        console.error('Failed to create offline project:', err);
        offlineProjectIdRef.current = null;
        setErrorMessage('Failed to create project. Please try again.');
      });
    },
    [brandId, createProject, router]
  );

  const advanceOfflineWizard = useCallback(
    (text: string) => {
      const userMsg: UIMessage = {
        id: generateId(),
        role: 'user',
        parts: [{ type: 'text' as const, text }],
      };
      setOfflineMessages((prev) => {
        const withUser = [...prev, userMsg];
        const { nextState, assistantMessages } = processOfflineWizardTurn(
          offlineWizardStateRef.current,
          text,
          offlineWizardContext
        );
        offlineWizardStateRef.current = nextState;
        const allMessages = [...withUser, ...assistantMessages];
        saveOfflineProjectIfComplete(nextState, allMessages);
        return allMessages;
      });
    },
    [offlineWizardContext, saveOfflineProjectIfComplete]
  );

  const handleClarificationSubmit = useCallback(
    (answers: Record<string, string>) => {
      const lines = Object.entries(answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      advanceOfflineWizard(`Here are my answers:\n${lines}`);
    },
    [advanceOfflineWizard]
  );

  const handleSendMessage = useCallback(
    async (text: string, attachments?: { name: string; type: string; dataUrl: string }[]) => {
      setErrorMessage(null);

      if (isOffline || apiModeRef.current === 'offline') {
        advanceOfflineWizard(text);
        return;
      }

      // Online: check API if unknown, then create project and navigate
      if (apiModeRef.current === 'unknown') {
        const ok = await checkCreateChatApiAvailable();
        if (!ok) {
          apiModeRef.current = 'offline';
          offlineBootstrapped.current = true;
          setIsOffline(true);
          setOfflineMessages(getOfflineWizardBootstrapMessages(offlineWizardContext, text));
          return;
        }
        apiModeRef.current = 'online';
      }

      await createProjectAndNavigate(text, attachments);
    },
    [isOffline, offlineWizardContext, advanceOfflineWizard, createProjectAndNavigate]
  );

  const handleHintClick = useCallback(
    (hint: string) => {
      void handleSendMessage(hint);
    },
    [handleSendMessage]
  );

  if (!brandId) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <div className={styles.emptyStateTitle}>Start creating</div>
            <div className={styles.emptyStateDescription}>
              Select a brand in the top bar to begin creating marketing assets.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Offline with messages — show chat directly
  if (isOffline && offlineMessages.length > 0) {
    return (
      <div className={styles.page}>
        <div className={styles.workspaceHeader}>
          <div className={styles.workspaceHeaderLeft}>
            <h2 className={styles.workspaceName}>Start creating</h2>
            <span className={styles.offlineBadge} title="Guided wizard — AI unavailable">
              Offline
            </span>
          </div>
        </div>
        {errorMessage && (
          <div className={styles.errorBanner}>
            <span>{errorMessage}</span>
            <Button attention="low" appearance="negative" onPress={() => setErrorMessage(null)}>
              Dismiss
            </Button>
          </div>
        )}
        <div className={styles.splitLayout}>
          <CreateChatActionsContext.Provider value={{ onClarificationSubmit: handleClarificationSubmit }}>
            <CreateChatPanel
              messages={offlineMessages}
              status="ready"
              onSendMessage={handleSendMessage}
              isOffline
            />
          </CreateChatActionsContext.Provider>
        </div>
      </div>
    );
  }

  // Default: centered empty state with hero + hints + chat input (matches ProjectWorkspace)
  return (
    <div className={styles.page}>
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <div className={styles.emptyStateTitle}>Start creating</div>
          <div className={styles.emptyStateDescription}>
            Describe the marketing asset you need. A project will be created automatically
            and AI will generate on-brand visuals for you.
          </div>

          {errorMessage && (
            <div className={styles.errorBanner}>
              <span>{errorMessage}</span>
              <Button attention="low" appearance="negative" onPress={() => setErrorMessage(null)}>
                Dismiss
              </Button>
            </div>
          )}

          <div className={styles.emptyStateHints}>
            {SUGGESTED_PROMPTS.map((hint) => (
              <Button
                key={hint}
                attention="low"
                appearance="neutral"
                disabled={isCreating}
                onPress={() => handleHintClick(hint)}
              >
                {hint}
              </Button>
            ))}
          </div>
        </div>

        <CreateChatActionsContext.Provider value={{ onClarificationSubmit: handleClarificationSubmit }}>
          <CreateChatPanel
            messages={offlineMessages}
            status={isCreating ? 'submitted' : 'ready'}
            onSendMessage={handleSendMessage}
            isOffline={isOffline}
            compact
          />
        </CreateChatActionsContext.Provider>
      </div>
    </div>
  );
}
