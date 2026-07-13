import type { Metadata } from 'next';
import { MarketingTemplate } from './MarketingTemplate';

export const metadata: Metadata = {
  title: 'Marketing Template Test | One UI Studio',
  description: 'Disposable OneUI component-only marketing website template.',
};

export default function MarketingTemplatePage() {
  return <MarketingTemplate />;
}
