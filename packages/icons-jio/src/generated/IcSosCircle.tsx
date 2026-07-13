import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSosCircle = forwardRef<SVGSVGElement, IconComponentProps>(function IcSosCircle(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M7.75 14h-1.5a.5.5 0 0 1 0-1h1.5a.25.25 0 1 0 0-.5h-1a1.25 1.25 0 0 1 0-2.5h1.5a.5.5 0 0 1 0 1h-1.5a.25.25 0 1 0 0 .5h1a1.25 1.25 0 0 1 0 2.5M12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4m5.25 0h-1.5a.5.5 0 0 1 0-1h1.5a.25.25 0 1 0 0-.5h-1a1.25 1.25 0 0 1 0-2.5h1.5a.5.5 0 0 1 0 1h-1.5a.25.25 0 1 0 0 .5h1a1.25 1.25 0 0 1 0 2.5M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcSosCircle.displayName = 'IcSosCircle';
