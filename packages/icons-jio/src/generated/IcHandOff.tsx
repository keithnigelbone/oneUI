import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHandOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcHandOff(
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
            d="M15 4c-.55 0-1 .45-1 1v.76l1.56-1.56c-.16-.11-.35-.2-.56-.2m-5 0c0-.55-.45-1-1-1s-1 .45-1 1v7.76l2-2zm3-1c0-.55-.45-1-1-1s-1 .45-1 1v5.76l2-2zm-6 9.5V7c0-.55-.45-1-1-1s-1 .45-1 1v7.76l2.05-2.05A.5.5 0 0 1 7 12.5m13.71-7.79A.996.996 0 1 0 19.3 3.3L3.29 19.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l1.6-1.6c1.19 1.7 3.09 2.85 5.28 2.89 3.06.06 5.72-1.88 6.6-4.8l1.77-5.91a1 1 0 0 0-.53-1.19.99.99 0 0 0-1.26.34l-1.71 2.56a.25.25 0 0 1-.46-.14V9.41l4.71-4.71z"
          />
    </svg>
  );
});

IcHandOff.displayName = 'IcHandOff';
