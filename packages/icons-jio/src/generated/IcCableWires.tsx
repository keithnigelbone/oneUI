import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCableWires = forwardRef<SVGSVGElement, IconComponentProps>(function IcCableWires(
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
            d="M17 13v-1c0-.55-.45-1-1-1V9.24c0-.53.21-1.03.59-1.41l1.12-1.12A.996.996 0 1 0 16.3 5.3l-1.12 1.12c-.76.76-1.17 1.76-1.17 2.83v1.76h-1v-7c0-.55-.45-1-1-1s-1 .45-1 1v7h-1V9.25c0-1.07-.42-2.07-1.17-2.83L7.72 5.3a.996.996 0 1 0-1.41 1.41l1.12 1.12c.38.38.59.88.59 1.41V11c-.55 0-1 .45-1 1v1h-1c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z"
          />
    </svg>
  );
});

IcCableWires.displayName = 'IcCableWires';
