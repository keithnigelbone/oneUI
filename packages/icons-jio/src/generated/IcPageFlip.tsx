import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPageFlip = forwardRef<SVGSVGElement, IconComponentProps>(function IcPageFlip(
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
            d="m15.66 6.61-10-3.5A2 2 0 0 0 3 5v10.5a2 2 0 0 0 1.34 1.89l10 3.5A2 2 0 0 0 17 19V8.5a2 2 0 0 0-1.34-1.89M20 10a1 1 0 0 0-1 1v8a1 1 0 0 0 2 0v-8a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcPageFlip.displayName = 'IcPageFlip';
