import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFluorescent = forwardRef<SVGSVGElement, IconComponentProps>(function IcFluorescent(
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
            d="M5 11v2c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1m-2-1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1m18 0c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1m-3.34 6.24a.996.996 0 1 0-1.41 1.41l1.41 1.41a.996.996 0 1 0 1.41-1.41zm-11.31 0-1.41 1.41a.996.996 0 1 0 1.41 1.41l1.41-1.41a.996.996 0 1 0-1.41-1.41M12.01 18c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1M6.34 7.76a.996.996 0 1 0 1.41-1.41L6.34 4.94a.996.996 0 1 0-1.41 1.41zm11.31-2.83-1.41 1.41a.996.996 0 1 0 1.41 1.41l1.41-1.41a.996.996 0 1 0-1.41-1.41M11.99 6c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1"
          />
    </svg>
  );
});

IcFluorescent.displayName = 'IcFluorescent';
