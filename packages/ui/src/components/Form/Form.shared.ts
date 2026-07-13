/**
 * Form.shared.ts
 * Shared types and hooks for Form component
 */

import type { CSSProperties, FormEvent, ReactNode } from 'react';

export interface FormProps {
  /** Form content */
  children: ReactNode;
  /** Called on form submission */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useFormState(props: FormProps) {
  return {};
}
