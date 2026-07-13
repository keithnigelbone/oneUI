import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHorizontalLayout = forwardRef<SVGSVGElement, IconComponentProps>(function IcHorizontalLayout(
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
            d="M9 1.99h5.99a2 2 0 0 1 2 2v7H7v-7a2 2 0 0 1 2-2M15 21.99H9.01a2 2 0 0 1-2-2v-7H17v7a2 2 0 0 1-2 2"
          />
    </svg>
  );
});

IcHorizontalLayout.displayName = 'IcHorizontalLayout';
