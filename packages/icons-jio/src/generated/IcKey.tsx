import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKey = forwardRef<SVGSVGElement, IconComponentProps>(function IcKey(
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
            d="m20.71 16.71-7.88-7.88c.112-.434.17-.881.17-1.33A5.5 5.5 0 1 0 7.5 13c.449 0 .896-.058 1.33-.17L10 14h2v2h2v2h2v2l.71.71a1 1 0 0 0 .7.29H20a1 1 0 0 0 1-1v-2.59a1 1 0 0 0-.29-.7M6.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcKey.displayName = 'IcKey';
