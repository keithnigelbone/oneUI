import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcOsNavHome = forwardRef<SVGSVGElement, IconComponentProps>(function IcOsNavHome(
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
            d="M10.67 2.51 4.01 8.43C3.37 9 3 9.82 3 10.67V18c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3v-7.33c0-.86-.37-1.67-1.01-2.24l-6.66-5.92c-.76-.67-1.9-.67-2.66 0"
          />
    </svg>
  );
});

IcOsNavHome.displayName = 'IcOsNavHome';
