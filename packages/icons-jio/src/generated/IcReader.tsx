import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcReader = forwardRef<SVGSVGElement, IconComponentProps>(function IcReader(
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
            d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m7.5 5H21v-3a2 2 0 0 0-2.79-1.84l-3.49 1.5a5.93 5.93 0 0 0-5.44 0l-3.49-1.5A2 2 0 0 0 3 10v3h1.5a1.5 1.5 0 1 1 0 3H3v1a2 2 0 0 0 1.21 1.84l7 3h.15l.14.05a1.8 1.8 0 0 0 1 0l.14-.05h.15l7-3A2 2 0 0 0 21 17v-1h-1.5a1.5 1.5 0 1 1 0-3"
          />
    </svg>
  );
});

IcReader.displayName = 'IcReader';
