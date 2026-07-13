import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCloud = forwardRef<SVGSVGElement, IconComponentProps>(function IcCloud(
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
            d="M20 11.54q.015-.27 0-.54A6 6 0 0 0 8.8 8a4 4 0 0 0-3.31 2.1A4.48 4.48 0 0 0 6 19h12a4 4 0 0 0 2-7.46"
          />
    </svg>
  );
});

IcCloud.displayName = 'IcCloud';
