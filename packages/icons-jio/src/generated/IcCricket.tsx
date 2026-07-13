import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCricket = forwardRef<SVGSVGElement, IconComponentProps>(function IcCricket(
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
            d="M15.994 17.008a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-13.41 2.41 2 2a2 2 0 0 0 2.82 0l10-10a2 2 0 0 0 .59-1.41v-2a2 2 0 0 0-.07-.51l3.78-3.78a1 1 0 0 0-.325-1.638 1 1 0 0 0-1.095.218l-3.78 3.78a2 2 0 0 0-.51-.07h-2a2 2 0 0 0-1.41.59l-10 10a2 2 0 0 0 0 2.82"
          />
    </svg>
  );
});

IcCricket.displayName = 'IcCricket';
