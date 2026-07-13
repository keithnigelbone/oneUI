import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSuccessColored = forwardRef<SVGSVGElement, IconComponentProps>(function IcSuccessColored(
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
      <circle cx={12} cy={12} r={10} fill="#fff" />
          <path
            fill="#25AB21"
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m5.21 7.71-6 6a1 1 0 0 1-1.42 0l-3-3a1.003 1.003 0 1 1 1.42-1.42l2.29 2.3 5.29-5.3a1.004 1.004 0 0 1 1.42 1.42"
          />
    </svg>
  );
});

IcSuccessColored.displayName = 'IcSuccessColored';
