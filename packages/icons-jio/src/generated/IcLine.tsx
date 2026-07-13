import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLine = forwardRef<SVGSVGElement, IconComponentProps>(function IcLine(
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
            d="m20.71 19.29-16-16A.996.996 0 1 0 3.3 4.7l15.99 16.01c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41z"
          />
    </svg>
  );
});

IcLine.displayName = 'IcLine';
