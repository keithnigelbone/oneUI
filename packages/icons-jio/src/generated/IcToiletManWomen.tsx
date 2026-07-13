import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcToiletManWomen = forwardRef<SVGSVGElement, IconComponentProps>(function IcToiletManWomen(
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
            d="M8 8.61a2 2 0 0 0-4 0l-1 5a2 2 0 0 0 .41 1.66A2 2 0 0 0 5 16v4a1 1 0 1 0 2 0v-4a2 2 0 0 0 1.55-.73A2 2 0 0 0 9 13.61zM6 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-6-3a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1m7 4h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2v4a1 1 0 0 0 2 0v-4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcToiletManWomen.displayName = 'IcToiletManWomen';
