import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLastpage = forwardRef<SVGSVGElement, IconComponentProps>(function IcLastpage(
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
            d="M6.71 4.29A.996.996 0 1 0 5.3 5.7l6.29 6.29-6.29 6.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l7-7a.996.996 0 0 0 0-1.41zM17 4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1"
          />
    </svg>
  );
});

IcLastpage.displayName = 'IcLastpage';
