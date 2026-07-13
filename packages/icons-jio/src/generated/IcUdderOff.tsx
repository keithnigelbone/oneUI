import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUdderOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcUdderOff(
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
            d="M3.44 14.75a2 2 0 0 0-.33 1.9L14.76 5H3a1 1 0 0 0-1 1 10 10 0 0 0 2.85 7zM19.15 13A10 10 0 0 0 22 6a1 1 0 0 0-1-1h-.59l.3-.29a1.004 1.004 0 1 0-1.42-1.42l-16 16a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l5-5 .31.08V19a2 2 0 1 0 4 0v-3.2q.94-.196 1.83-.56l1.61 2A2 2 0 0 0 19 18a2 2 0 0 0 1.56-3.25z"
          />
    </svg>
  );
});

IcUdderOff.displayName = 'IcUdderOff';
