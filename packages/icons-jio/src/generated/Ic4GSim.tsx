import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const Ic4GSim = forwardRef<SVGSVGElement, IconComponentProps>(function Ic4GSim(
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
            d="M9.5 17v-.29l-.29.29zm8.62-14.12A3 3 0 0 0 16 2h-5a2.86 2.86 0 0 0-1.32.29 3 3 0 0 0-1.06.84l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12M11 18h-.5v.5a.5.5 0 0 1-1 0V18H8a.5.5 0 0 1-.46-.31.47.47 0 0 1 .11-.54l2-2a.36.36 0 0 1 .16-.15.5.5 0 0 1 .65.27.4.4 0 0 1 0 .19V17H11a.5.5 0 0 1 0 1m3.5 1a2 2 0 0 1 0-4h.5a.5.5 0 0 1 0 1h-.5a1 1 0 1 0 .85 1.5H15a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5 2 2 0 0 1-2 2"
          />
    </svg>
  );
});

Ic4GSim.displayName = 'Ic4GSim';
