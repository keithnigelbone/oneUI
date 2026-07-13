import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEllipse = forwardRef<SVGSVGElement, IconComponentProps>(function IcEllipse(
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
            d="M12 20c5.523 0 10-3.582 10-8s-4.477-8-10-8S2 7.582 2 12s4.477 8 10 8"
          />
    </svg>
  );
});

IcEllipse.displayName = 'IcEllipse';
