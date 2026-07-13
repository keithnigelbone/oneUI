import type { ReactNode } from 'react';
import { ConvexClientProvider } from '@/providers/ConvexClientProvider';
import { TemplateTestProviders } from './TemplateTestProviders';

export default function TemplateTestsLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <TemplateTestProviders>{children}</TemplateTestProviders>
    </ConvexClientProvider>
  );
}
