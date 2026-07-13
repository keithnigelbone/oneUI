import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallEnd = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallEnd(
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
            d="M12 8c-5.29 0-7.72 2.28-8.6 3.4a1.93 1.93 0 0 0-.4 1.2V14a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1.4a1.93 1.93 0 0 0-.4-1.2C19.72 10.28 17.29 8 12 8"
          />
    </svg>
  );
});

IcCallEnd.displayName = 'IcCallEnd';
