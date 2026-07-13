import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKiranaStore = forwardRef<SVGSVGElement, IconComponentProps>(function IcKiranaStore(
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
            d="M17 3H7a3 3 0 0 0-3 3v4a1 1 0 0 0 1 1 2.62 2.62 0 0 0 1.82-.74c.25-.22.31-.26.52-.26s.26 0 .51.26a2.62 2.62 0 0 0 1.82.74 2.58 2.58 0 0 0 1.82-.74c.26-.22.31-.26.52-.26s.26 0 .51.26a2.61 2.61 0 0 0 3.64 0c.25-.22.3-.26.51-.26s.26 0 .51.26A2.62 2.62 0 0 0 19 11a1 1 0 0 0 1-1V6a3 3 0 0 0-3-3M20 19h-1v-6a4.5 4.5 0 0 1-2-.46V15H7v-2.46A4.5 4.5 0 0 1 5 13v6H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcKiranaStore.displayName = 'IcKiranaStore';
