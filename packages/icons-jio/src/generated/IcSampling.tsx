import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSampling = forwardRef<SVGSVGElement, IconComponentProps>(function IcSampling(
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
            d="M19 3H5c-1.1 0-2 .9-2 2s.9 2 2 2v11c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V7c1.1 0 2-.9 2-2s-.9-2-2-2m-3 11c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1v-3c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"
          />
    </svg>
  );
});

IcSampling.displayName = 'IcSampling';
