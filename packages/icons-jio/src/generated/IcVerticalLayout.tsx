import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVerticalLayout = forwardRef<SVGSVGElement, IconComponentProps>(function IcVerticalLayout(
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
            d="M6 1.99h5v20H6c-1.1 0-2-.9-2-2v-16c0-1.1.9-2 2-2M18 21.99h-5v-20h5c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2"
          />
    </svg>
  );
});

IcVerticalLayout.displayName = 'IcVerticalLayout';
