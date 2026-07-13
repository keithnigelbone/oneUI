import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAward = forwardRef<SVGSVGElement, IconComponentProps>(function IcAward(
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
            d="M20 10a8 8 0 1 0-12.53 6.59L7 19.72a2 2 0 0 0 3.09 1.94L12 20.4l1.89 1.26A2 2 0 0 0 15 22a2.002 2.002 0 0 0 1.98-2.31l-.45-3.13A8 8 0 0 0 20 10m-8 6a6 6 0 1 1 0-12 6 6 0 0 1 0 12m2.49-7.16-1.34-.2-.61-1.29a.59.59 0 0 0-1.08 0l-.61 1.29-1.34.2a.6.6 0 0 0-.34 1l1 1-.25 1.46a.61.61 0 0 0 .89.63l1.19-.66 1.19.66a.631.631 0 0 0 .64-.04.61.61 0 0 0 .25-.59l-.24-1.43 1-1a.6.6 0 0 0-.34-1z"
          />
    </svg>
  );
});

IcAward.displayName = 'IcAward';
