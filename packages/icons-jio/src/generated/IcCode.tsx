import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCode = forwardRef<SVGSVGElement, IconComponentProps>(function IcCode(
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
            d="M7.71 7.29a.996.996 0 0 0-1.41 0l-4.01 4a.996.996 0 0 0 0 1.41l4 4c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41L4.42 12l3.29-3.29a.996.996 0 0 0 0-1.41zm14 4-4-4A.996.996 0 1 0 16.3 8.7l3.29 3.29-3.29 3.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l4-4a.996.996 0 0 0 0-1.41zm-7.43-7.25c-.53-.15-1.08.16-1.24.69l-4 14a1.012 1.012 0 0 0 .97 1.28c.44 0 .84-.29.96-.73l3.99-14.01c.15-.53-.16-1.08-.69-1.24z"
          />
    </svg>
  );
});

IcCode.displayName = 'IcCode';
