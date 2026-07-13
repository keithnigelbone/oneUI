/**
 * Inline SVG icons for layout-level Platform components.
 *
 * These replace lucide-react imports in Shell/LeftNav/TopBar/Settings,
 * which render on every route. Using inline SVGs avoids pulling the
 * full lucide-react library into the critical path.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  'data-open'?: boolean;
}

function makeIcon(displayName: string, children: React.ReactNode) {
  const Icon = ({ size = 24, className, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

// LeftNav icons
export const Sun = makeIcon('Sun', <>
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" /><path d="M12 20v2" />
  <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
  <path d="M2 12h2" /><path d="M20 12h2" />
  <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
</>);

export const Moon = makeIcon('Moon', <>
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
</>);

export const Settings = makeIcon('Settings', <>
  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  <circle cx="12" cy="12" r="3" />
</>);

export const HelpCircle = makeIcon('HelpCircle', <>
  <circle cx="12" cy="12" r="10" />
  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
  <path d="M12 17h.01" />
</>);

// BrandSelector / PlatformSelector icons
export const ChevronDown = makeIcon('ChevronDown', <>
  <path d="m6 9 6 6 6-6" />
</>);

export const Check = makeIcon('Check', <>
  <path d="M20 6 9 17l-5-5" />
</>);

export const Plus = makeIcon('Plus', <>
  <path d="M5 12h14" /><path d="M12 5v14" />
</>);

// PlatformSelector icons
export const Monitor = makeIcon('Monitor', <>
  <rect width="20" height="14" x="2" y="3" rx="2" />
  <line x1="8" x2="16" y1="21" y2="21" />
  <line x1="12" x2="12" y1="17" y2="21" />
</>);

export const Tablet = makeIcon('Tablet', <>
  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
  <line x1="12" x2="12.01" y1="18" y2="18" />
</>);

export const Smartphone = makeIcon('Smartphone', <>
  <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
  <path d="M12 18h.01" />
</>);

export const Tv = makeIcon('Tv', <>
  <path d="m17 2-5 5-5-5" />
  <rect width="20" height="15" x="2" y="7" rx="2" />
</>);

export const Globe = makeIcon('Globe', <>
  <circle cx="12" cy="12" r="10" />
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
  <path d="M2 12h20" />
</>);

export const RotateCcw = makeIcon('RotateCcw', <>
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
  <path d="M3 3v5h5" />
</>);

export const Scaling = makeIcon('Scaling', <>
  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
</>);

// SettingsModal
export const X = makeIcon('X', <>
  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
</>);
