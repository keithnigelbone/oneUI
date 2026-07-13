import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFanAutoSpeed = forwardRef<SVGSVGElement, IconComponentProps>(function IcFanAutoSpeed(
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
            d="M16 7c0-3.16-2-4-3-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1c1 0 3-.84 3-4m4 5h-6a1 1 0 0 0-1 1c0 1 .84 3 4 3s4-2 4-3a1 1 0 0 0-1-1m-2.68-2a.51.51 0 0 0 .68-.32l.22-.68h1.56l.25.68a.51.51 0 0 0 .47.32h.18a.51.51 0 0 0 .32-.68l-1.5-4a.52.52 0 0 0-.94 0l-1.5 4a.51.51 0 0 0 .26.68M19 6.92 19.4 8h-.8zM11 13c-1 0-3 .84-3 4s2 4 3 4a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1m0-2c0-1-.84-3-4-3s-4 2-4 3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1"
          />
    </svg>
  );
});

IcFanAutoSpeed.displayName = 'IcFanAutoSpeed';
