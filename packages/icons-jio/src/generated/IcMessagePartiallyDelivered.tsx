import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMessagePartiallyDelivered = forwardRef<SVGSVGElement, IconComponentProps>(function IcMessagePartiallyDelivered(
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
            d="M19.71 6.29a1 1 0 0 0-1.42 0L8 16.59l-4.29-4.3a1.004 1.004 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l11-11a1 1 0 0 0 0-1.42M20.5 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcMessagePartiallyDelivered.displayName = 'IcMessagePartiallyDelivered';
