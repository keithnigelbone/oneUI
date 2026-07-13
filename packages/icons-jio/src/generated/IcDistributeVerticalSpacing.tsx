import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDistributeVerticalSpacing = forwardRef<SVGSVGElement, IconComponentProps>(function IcDistributeVerticalSpacing(
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
            d="M20 3H4c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1m-.5 16h-15c-.55 0-1 .45-1 1s.45 1 1 1h15c.55 0 1-.45 1-1s-.45-1-1-1M16 17c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3H8c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3z"
          />
    </svg>
  );
});

IcDistributeVerticalSpacing.displayName = 'IcDistributeVerticalSpacing';
