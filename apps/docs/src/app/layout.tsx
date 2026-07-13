import '@oneui/tokens/css/layers';
import '@oneui/tokens/css/dimensions/scale';
import '@oneui/tokens/css/dimensions/grid';
import '@oneui/tokens/css/typography';
import '@oneui/tokens/css';
import '@oneui/tokens/css/semantic';
import '@oneui/tokens/css/light';
import '@oneui/tokens/css/dark';
import '@oneui/tokens/css/density/compact';
import '@oneui/tokens/css/density/open';
import '@oneui/tokens/css/materials';
import '@oneui/ui/styles';
import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DocsProviders } from '@/components/DocsProviders';

export const metadata: Metadata = {
  title: {
    default: 'OneUI Design System',
    template: '%s | OneUI Design System',
  },
  description: 'Multi-brand documentation for the OneUI design system.',
};

const bootstrapScript = `(function(){try{
var t=localStorage.getItem('oneui-docs:theme');
document.documentElement.setAttribute('data-mode',(t==='light'||t==='dark')?t:'light');
var d=localStorage.getItem('oneui-docs:density');
var dv=(d==='compact'||d==='default'||d==='open')?d:'default';
document.documentElement.setAttribute('data-density',dv);
document.documentElement.setAttribute('data-6-Density',dv);
var w=window.innerWidth;
// Resolves the canonical data-Breakpoint (S/M/L) on the unified 619/990 ladder,
// matching the platform app's PlatformContext. scale.css's [data-Breakpoint]
// blocks drive the dimension cascade.
var b=w<=619?'S':w<=990?'M':'L';
document.documentElement.setAttribute('data-Breakpoint',b);
}catch(e){
document.documentElement.setAttribute('data-mode','light');
document.documentElement.setAttribute('data-density','default');
document.documentElement.setAttribute('data-6-Density','default');
document.documentElement.setAttribute('data-Breakpoint','L');
}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      data-density="default"
      suppressHydrationWarning
    >
      <head>
        <style id="oneui-foundation-tokens" suppressHydrationWarning />
        <style id="oneui-docs-dimension-tokens" suppressHydrationWarning />
        <style id="oneui-docs-component-tokens" suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
        <style dangerouslySetInnerHTML={{ __html: `[data-brand-switching],[data-brand-switching] *{transition:none!important;}` }} />
      </head>
      <body>
        <DocsProviders>{children}</DocsProviders>
      </body>
    </html>
  );
}
