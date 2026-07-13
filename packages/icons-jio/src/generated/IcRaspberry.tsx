import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRaspberry = forwardRef<SVGSVGElement, IconComponentProps>(function IcRaspberry(
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
            d="M20 14.5a3 3 0 0 0-2.08-2.84 3 3 0 0 0-3.62-3.57 3 3 0 0 0-4.6 0 3 3 0 0 0-3.62 3.57 3 3 0 0 0 0 5.68 3 3 0 0 0 3.62 3.57 3 3 0 0 0 4.6 0 3 3 0 0 0 3.62-3.57A3 3 0 0 0 20 14.5m-10-2a1 1 0 1 1 2 0 1 1 0 0 1-2 0m2.71 5.71a1 1 0 1 1-1.409-1.42 1 1 0 0 1 1.409 1.42M15 15.5a1 1 0 1 1 0-2.002 1 1 0 0 1 0 2.002M12 6c2.31 0 3.3-2.24 3.49-3.42a.46.46 0 0 0-.11-.4A.46.46 0 0 0 15 2a3.83 3.83 0 0 0-3 2 3.83 3.83 0 0 0-3-2 .46.46 0 0 0-.38.18.46.46 0 0 0-.11.4C8.7 3.76 9.69 6 12 6"
          />
    </svg>
  );
});

IcRaspberry.displayName = 'IcRaspberry';
