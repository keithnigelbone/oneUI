import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHdrOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcHdrOff(
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
            d="m12.27 8 2.55 2.55A3.08 3.08 0 0 0 12.27 8M4.71 3.29a1.004 1.004 0 1 0-1.42 1.42l3.37 3.36A1 1 0 0 0 6 9v2H4V9a1 1 0 0 0-2 0v6a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0V9.41l1 1V15a1 1 0 0 0 1 1h2a2.76 2.76 0 0 0 1.81-.77l5.48 5.48a1.002 1.002 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095zM12 14h-1v-1.59l1.4 1.41a.9.9 0 0 1-.4.18m9.18-.92A3 3 0 0 0 19 8h-2a1 1 0 0 0-1 1v2.76L18.24 14H19q.18.015.36 0l.75 1.49A1 1 0 0 0 21 16a.93.93 0 0 0 .45-.11 1 1 0 0 0 .44-1.34zM19 12h-1v-2h1a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcHdrOff.displayName = 'IcHdrOff';
