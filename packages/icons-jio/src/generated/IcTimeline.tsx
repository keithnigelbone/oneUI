import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTimeline = forwardRef<SVGSVGElement, IconComponentProps>(function IcTimeline(
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
            d="M4 15v2a1 1 0 0 0 1 1h4v-4H5a1 1 0 0 0-1 1m14-4V9a1 1 0 0 0-1-1h-2v4h2a1 1 0 0 0 1-1m-5-9h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 .29.71l.71.7v13a1.5 1.5 0 1 0 2 0v-13l.71-.7A1 1 0 0 0 14 5V3a1 1 0 0 0-1-1m6 12h-4v4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1M4 9v2a1 1 0 0 0 1 1h4V8H5a1 1 0 0 0-1 1"
          />
    </svg>
  );
});

IcTimeline.displayName = 'IcTimeline';
