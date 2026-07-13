import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSos = forwardRef<SVGSVGElement, IconComponentProps>(function IcSos(
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
            d="M5.5 11h-1a.5.5 0 0 1 0-1h2a1 1 0 0 0 0-2h-2a2.5 2.5 0 1 0 0 5h1a.5.5 0 0 1 0 1h-2a1 1 0 0 0 0 2h2a2.5 2.5 0 0 0 0-5M12 8a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0v-2a3 3 0 0 0-3-3m1 5a1 1 0 0 1-2 0v-2a1 1 0 0 1 2 0zm6.5-2h-1a.5.5 0 0 1 0-1h2a1 1 0 1 0 0-2h-2a2.5 2.5 0 0 0 0 5h1a.5.5 0 0 1 0 1h-2a1 1 0 0 0 0 2h2a2.5 2.5 0 0 0 0-5"
          />
    </svg>
  );
});

IcSos.displayName = 'IcSos';
