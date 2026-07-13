import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRemoteUniversalA = forwardRef<SVGSVGElement, IconComponentProps>(function IcRemoteUniversalA(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="M11.6 16h.8l-.4-1.08zm4.52-13.12A3 3 0 0 0 14 2h-4a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12M9 4.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-1.39 1.41.94.94 0 0 1-.36-.45A1 1 0 0 1 9 4.8m.42 5a.94.94 0 0 1-.36-.45A1 1 0 0 1 9 8.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-1.39 1.41zm4.26 8.2q-.09.015-.18 0a.51.51 0 0 1-.47-.32l-.25-.68h-1.56l-.25.68a.503.503 0 1 1-.94-.36l1.5-4a.52.52 0 0 1 .94 0l1.5 4a.52.52 0 0 1-.29.68m1-8.26a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45A1 1 0 0 1 13 8.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm0-4a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45A1 1 0 0 1 13 4.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27z"
          />
    </svg>
  );
});

IcRemoteUniversalA.displayName = 'IcRemoteUniversalA';
