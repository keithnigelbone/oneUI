import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKitchenExtractor = forwardRef<SVGSVGElement, IconComponentProps>(function IcKitchenExtractor(
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
            d="M6 17a1 1 0 0 0 0 2 1 1 0 0 1 1 1v1a1 1 0 1 0 2 0v-1a3 3 0 0 0-3-3m6 0a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1m7.41-5.41-3-3a1.5 1.5 0 0 0-.41-.31V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4.28a1.5 1.5 0 0 0-.41.31l-3 3a2 2 0 0 0-.44 2.18A2 2 0 0 0 6 15h12a2 2 0 0 0 1.85-1.23 2 2 0 0 0-.44-2.18M18 17a3 3 0 0 0-3 3v1a1 1 0 0 0 2 0v-1a1 1 0 0 1 1-1 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcKitchenExtractor.displayName = 'IcKitchenExtractor';
