import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMail = forwardRef<SVGSVGElement, IconComponentProps>(function IcMail(
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
            d="M19.7 6.46A2.66 2.66 0 0 0 17.34 5H6.67c-1.03 0-1.92.6-2.36 1.46l7.7 4.62 7.7-4.62z"
          />
          <path
            fill="currentColor"
            d="M12.91 12.6a1.78 1.78 0 0 1-1.84.01L3.99 8.35v7.98c0 1.48 1.19 2.67 2.67 2.67h10.67c1.48 0 2.67-1.19 2.67-2.67V8.35l-7.08 4.25z"
          />
    </svg>
  );
});

IcMail.displayName = 'IcMail';
