import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIntercomCalls = forwardRef<SVGSVGElement, IconComponentProps>(function IcIntercomCalls(
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
            d="M6 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m15.12 1.88A3 3 0 0 0 19 4H9v16h10a3 3 0 0 0 3-3V7a3 3 0 0 0-.88-2.12m-7.91 12.83a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.06-.58 1 1 0 0 1 .78-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm0-3a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.06-.58 1 1 0 0 1 .78-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm3 3a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.06-.58 1 1 0 0 1 .78-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm0-3a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.06-.58 1 1 0 0 1 .78-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm3 3a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.06-.58 1 1 0 0 1 .78-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zm0-3a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.06-.58 1 1 0 0 1 .78-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zM19.5 9a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"
          />
    </svg>
  );
});

IcIntercomCalls.displayName = 'IcIntercomCalls';
