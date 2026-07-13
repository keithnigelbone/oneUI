import { useCallback, useRef, useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type { UIMessage } from 'ai';

export function useCreateChatPersistence(projectId: Id<'createProjects'> | undefined) {
  const storedMessages = useQuery(
    api.createProjects.listMessages,
    projectId ? { projectId } : 'skip'
  );
  const createMessage = useMutation(api.createProjects.createMessage);

  const savedMessageIds = useRef<Set<string>>(new Set());
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!storedMessages || initializedRef.current) return;
    initializedRef.current = true;

    const restored: UIMessage[] = storedMessages.map((msg) => {
      const id = msg._id;
      savedMessageIds.current.add(id);
      return {
        id,
        role: msg.role as 'user' | 'assistant' | 'system',
        parts: msg.parts ?? [{ type: 'text' as const, text: msg.content }],
        createdAt: new Date(msg.createdAt),
      };
    });
    setInitialMessages(restored);
  }, [storedMessages]);

  const saveMessages = useCallback(
    async (messages: UIMessage[]) => {
      if (!projectId) return;

      for (const msg of messages) {
        if (savedMessageIds.current.has(msg.id)) continue;
        savedMessageIds.current.add(msg.id);

        const content =
          msg.parts
            ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join('\n') ?? '';

        await createMessage({
          projectId,
          role: msg.role as 'user' | 'assistant' | 'system',
          content,
          parts: msg.parts,
        });
      }
    },
    [projectId, createMessage]
  );

  return {
    initialMessages,
    saveMessages,
    isLoaded: initializedRef.current || storedMessages !== undefined,
  };
}
