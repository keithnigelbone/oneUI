import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCloudyDreary = forwardRef<SVGSVGElement, IconComponentProps>(function IcCloudyDreary(
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
            d="M7.26 15.9a5.03 5.03 0 0 1 4.27-3.38A6 6 0 0 1 16 10.5c2.37 0 4.48 1.42 5.44 3.51.35-.59.56-1.27.56-2.01 0-1.52-.86-2.82-2.1-3.5a5.002 5.002 0 0 0-4.9-6c-1.67 0-3.15.83-4.06 2.1-.31-.06-.62-.1-.94-.1-2.61 0-4.72 2-4.95 4.55A3.49 3.49 0 0 0 2 12.5C2 14.43 3.57 16 5.5 16h1.58c.06-.03.12-.07.18-.1m12.64-.24a4 4 0 0 0-3.91-3.15c-1.5 0-2.79.83-3.47 2.05a2.996 2.996 0 0 0-3.53 2.95c-1.1 0-2 .9-2 2s.9 2 2 2h10a2.996 2.996 0 0 0 .91-5.85"
          />
    </svg>
  );
});

IcCloudyDreary.displayName = 'IcCloudyDreary';
