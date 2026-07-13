'use client';

import { createContext, useContext } from 'react';

export interface CreateChatActions {
  onClarificationSubmit?: (answers: Record<string, string>) => void;
}

export const CreateChatActionsContext = createContext<CreateChatActions>({});

export function useCreateChatActions() {
  return useContext(CreateChatActionsContext);
}
