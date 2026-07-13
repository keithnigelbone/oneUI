import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcResumeWatching = forwardRef<SVGSVGElement, IconComponentProps>(function IcResumeWatching(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-8 5a1 1 0 0 1 .53-.88 1 1 0 0 1 1 0l3 2a1 1 0 0 1 0 1.66l-3 2A1 1 0 0 1 10 12zm7 10H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcResumeWatching.displayName = 'IcResumeWatching';
