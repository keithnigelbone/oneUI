/**
 * Registers the same Jio icon pipeline as Storybook (`apps/storybook/.storybook/preview.ts`)
 * so semantic icons (`heart`, `user`, …) resolve inside the QA playground.
 *
 * Requires `apps/platform/public/jio-icons-data.json` — generate with
 * `pnpm build:jio-icons` from the repo root if the file is missing.
 */
import React from 'react';
import { setJioIconLoader } from '@oneui/ui/icons/IconContext';
import type { IconComponent } from '@oneui/shared';

import jioIconsRaw from '../../../platform/public/jio-icons-data.json';

const jioIconsData = jioIconsRaw as Record<string, { v: string; d: string }>;
const jioComponentCache: Record<string, IconComponent> = {};

function loadJioIconForQaPlayground(name: string): Promise<IconComponent | null> {
  if (jioComponentCache[name]) return Promise.resolve(jioComponentCache[name]);
  const iconData = jioIconsData[name];
  if (!iconData) return Promise.resolve(null);
  const SvgIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) =>
    React.createElement('svg', {
      ref,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: iconData.v,
      ...props,
      dangerouslySetInnerHTML: { __html: iconData.d },
    }),
  );
  SvgIcon.displayName = `JioIcon_${name}`;
  jioComponentCache[name] = SvgIcon as unknown as IconComponent;
  return Promise.resolve(SvgIcon as unknown as IconComponent);
}

let registered = false;

/** Call once before React renders any `<Icon />` (see `main.tsx`). */
export function initQaJioIcons(): void {
  if (registered) return;
  setJioIconLoader(loadJioIconForQaPlayground);
  registered = true;
}
