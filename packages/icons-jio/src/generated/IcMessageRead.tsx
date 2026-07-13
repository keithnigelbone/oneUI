import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMessageRead = forwardRef<SVGSVGElement, IconComponentProps>(function IcMessageRead(
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
            d="M12 15a1 1 0 0 0 .71-.29l7-7a1.004 1.004 0 0 0-1.42-1.42l-7 7A1 1 0 0 0 12 15m-8.29-2.71a1.004 1.004 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.64-.325 1 1 0 0 0-.22-1.095zm18-4a1 1 0 0 0-1.42 0L12 16.59l-4.29-4.3a1.004 1.004 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42"
          />
    </svg>
  );
});

IcMessageRead.displayName = 'IcMessageRead';
