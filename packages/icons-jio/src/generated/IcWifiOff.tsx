import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWifiOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcWifiOff(
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
            d="M5.4 12.81a1 1 0 0 0 1.41.11l.12-.1 3.73-3.72a10.06 10.06 0 0 0-5.15 2.3 1 1 0 0 0-.11 1.41M4 10.08A11.94 11.94 0 0 1 12 7h.72l1.81-1.8A14.3 14.3 0 0 0 12 5a14 14 0 0 0-9.34 3.59A1.002 1.002 0 0 0 4 10.08m17.34-1.49a14 14 0 0 0-2.63-1.85L20.49 5a1.055 1.055 0 0 0-1.148-1.719q-.193.08-.342.229L3.51 19A1.052 1.052 0 1 0 5 20.49l4.7-4.71a4 4 0 0 1 4.73 0 1 1 0 0 0 1.2-1.6 6 6 0 0 0-3.2-1.16l1.76-1.75a8 8 0 0 1 3 1.62 1 1 0 0 0 1.3-1.52 9.9 9.9 0 0 0-2.78-1.67l1.52-1.52c1.008.5 1.94 1.14 2.77 1.9a1 1 0 0 0 1.075.163 1 1 0 0 0 .265-1.653M12 17a1.5 1.5 0 1 0 0 2.999 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcWifiOff.displayName = 'IcWifiOff';
