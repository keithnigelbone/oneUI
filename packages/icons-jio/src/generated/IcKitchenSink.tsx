import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKitchenSink = forwardRef<SVGSVGElement, IconComponentProps>(function IcKitchenSink(
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
            d="M19 11h-2V6a3 3 0 0 0-6 0 1 1 0 0 0 2 0 1 1 0 0 1 2 0v5H7V9h1a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2h1v2a2 2 0 1 0 0 4v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0 0-4"
          />
    </svg>
  );
});

IcKitchenSink.displayName = 'IcKitchenSink';
