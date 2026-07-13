import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKarate = forwardRef<SVGSVGElement, IconComponentProps>(function IcKarate(
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
            d="M20.66 3.25a1 1 0 0 0-1.41.09l-6.39 7.3-2.75-2.06 2.05-1.47A2 2 0 0 0 13 5.49V4a1 1 0 0 0-2 0v1.49l-6.16 4.4A2 2 0 0 0 4 11.51V14a1 1 0 1 0 2 0v-2.49L8.4 9.8l3.6 2.7V20a1 1 0 0 0 2 0v-7.62l6.75-7.72a1 1 0 0 0-.09-1.41M6 6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"
          />
    </svg>
  );
});

IcKarate.displayName = 'IcKarate';
