import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSkull = forwardRef<SVGSVGElement, IconComponentProps>(function IcSkull(
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
            d="M12 2a8.51 8.51 0 0 0-8.5 8.5c0 2.82.38 5.32 2.5 6.86V20a2 2 0 0 0 2 2h1v-2a1 1 0 1 1 2 0v2h2v-2a1 1 0 0 1 2 0v2h1a2 2 0 0 0 2-2v-2.64c2.12-1.54 2.5-4 2.5-6.86A8.51 8.51 0 0 0 12 2M8.5 15a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m7 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5"
          />
    </svg>
  );
});

IcSkull.displayName = 'IcSkull';
