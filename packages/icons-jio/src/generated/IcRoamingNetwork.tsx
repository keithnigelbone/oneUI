import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRoamingNetwork = forwardRef<SVGSVGElement, IconComponentProps>(function IcRoamingNetwork(
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
            d="M8.16 8.08A3 3 0 0 0 6 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0V9h1q.18.015.36 0l.75 1.49A1 1 0 0 0 8 11a.93.93 0 0 0 .45-.11 1 1 0 0 0 .44-1.34zM6 7H5V5h1a1 1 0 1 1 0 2m0 10a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1M18.71 3.29A1 1 0 0 0 17 4v16a1 1 0 0 0 2 0V4a1 1 0 0 0-.29-.71M14 7a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1m-4 6a1 1 0 0 0-1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcRoamingNetwork.displayName = 'IcRoamingNetwork';
