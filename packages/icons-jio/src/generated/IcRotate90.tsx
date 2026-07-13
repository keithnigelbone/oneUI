import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRotate90 = forwardRef<SVGSVGElement, IconComponentProps>(function IcRotate90(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 25 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="M21.71 8.79c-.33-.33-.84-.36-1.22-.13v-.68c0-2.73-2.24-4.96-5-4.96-.55 0-1 .45-1 1s.45 1 1 1c1.65 0 3 1.33 3 2.96v.69a.99.99 0 0 0-1.17.17.996.996 0 0 0 0 1.41l1.44 1.44c.18.19.44.32.72.32.27 0 .52-.11.71-.29l1.51-1.51a.996.996 0 0 0 0-1.41zM12.39 8H5.65a2.63 2.63 0 0 0-2.63 2.63v6.74A2.63 2.63 0 0 0 5.65 20h6.74a2.63 2.63 0 0 0 2.63-2.63v-6.74A2.63 2.63 0 0 0 12.39 8"
          />
    </svg>
  );
});

IcRotate90.displayName = 'IcRotate90';
