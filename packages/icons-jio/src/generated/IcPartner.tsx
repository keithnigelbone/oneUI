import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPartner = forwardRef<SVGSVGElement, IconComponentProps>(function IcPartner(
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
            d="M20.5 8.61a1.49 1.49 0 0 0-1-2.61 1.7 1.7 0 0 0-.51.09l-5.54-2.95a1.49 1.49 0 0 0-2.9 0L5 6.09a1.49 1.49 0 0 0-1.5 2.52v6.78A1.49 1.49 0 0 0 5 17.91l5.54 2.95a1.49 1.49 0 0 0 2.9 0L19 17.91q.249.084.51.09a1.49 1.49 0 0 0 1-2.61zM12 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 8h-4a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-1 1"
          />
    </svg>
  );
});

IcPartner.displayName = 'IcPartner';
