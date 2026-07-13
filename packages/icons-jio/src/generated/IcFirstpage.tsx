import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFirstpage = forwardRef<SVGSVGElement, IconComponentProps>(function IcFirstpage(
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
            d="M7 4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1m5.41 8 6.29-6.29a.996.996 0 1 0-1.41-1.41l-7 7a.996.996 0 0 0 0 1.41l7 7c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-6.29-6.29z"
          />
    </svg>
  );
});

IcFirstpage.displayName = 'IcFirstpage';
