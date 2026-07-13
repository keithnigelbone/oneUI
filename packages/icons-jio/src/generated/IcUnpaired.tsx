import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUnpaired = forwardRef<SVGSVGElement, IconComponentProps>(function IcUnpaired(
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
            d="M13.71 13.29a1 1 0 0 0-1.42 0l-.91.92-1.59-1.59.92-.91a1.004 1.004 0 0 0-1.42-1.42l-.91.92-.62-.62a1 1 0 0 0-1.42 0l-1.29 1.29a3 3 0 0 0 0 4.24l.71.71-2.47 2.46a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2.46-2.47.71.71a3 3 0 0 0 4.24 0l1.29-1.29a1 1 0 0 0 .219-1.095 1 1 0 0 0-.22-.325l-.62-.62.92-.91a1 1 0 0 0 .22-1.095 1 1 0 0 0-.22-.325m7-10a1 1 0 0 0-1.42 0l-2.46 2.47-.71-.71a3 3 0 0 0-4.24 0l-1.29 1.29a1 1 0 0 0 0 1.42l5.65 5.65a1 1 0 0 0 1.42 0L19 12.12a3 3 0 0 0 0-4.24l-.71-.71 2.47-2.46a1 1 0 0 0-.05-1.42"
          />
    </svg>
  );
});

IcUnpaired.displayName = 'IcUnpaired';
