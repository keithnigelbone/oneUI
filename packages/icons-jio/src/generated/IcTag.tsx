import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTag = forwardRef<SVGSVGElement, IconComponentProps>(function IcTag(
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
            d="m22 10.53-.7-5.24a3 3 0 0 0-2.59-2.59L13.47 2a3 3 0 0 0-2.5.86L2.88 11a3 3 0 0 0 0 4.24l5.91 5.91a3 3 0 0 0 4.24 0L21.12 13a3.05 3.05 0 0 0 .88-2.47M16.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcTag.displayName = 'IcTag';
