import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIncognito = forwardRef<SVGSVGElement, IconComponentProps>(function IcIncognito(
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
            d="M20 17h-1.11a3 3 0 0 0-5.63 0h-2.44a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2h1.18a3 3 0 0 0 5.64 0h2.44a3 3 0 0 0 5.63 0H20a1 1 0 1 0 0-2m1-6h-1.56l-2.51-6.75a1.94 1.94 0 0 0-1.2-1.16 1.82 1.82 0 0 0-1.56.2 5.15 5.15 0 0 1-4.34 0 1.82 1.82 0 0 0-1.56-.2 1.94 1.94 0 0 0-1.2 1.16L4.56 11H3a1 1 0 0 0 0 2h18a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcIncognito.displayName = 'IcIncognito';
