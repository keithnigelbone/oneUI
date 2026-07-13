import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNoInternet = forwardRef<SVGSVGElement, IconComponentProps>(function IcNoInternet(
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
            d="M21.24 8.17c-.37-.9-.87-1.73-1.48-2.48l1.25-1.25c.4-.4.4-1.04 0-1.44s-1.04-.4-1.44 0L3 19.56c-.4.4-.4 1.04 0 1.44s1.04.4 1.44 0l1.26-1.26a9.92 9.92 0 0 0 10.13 1.5 10.04 10.04 0 0 0 4.49-3.68A10 10 0 0 0 22.01 12c0-1.31-.26-2.61-.76-3.83zm-2.92-1.05c.22.28.42.57.6.88h-1.48zm-11.2 11.2.68-.68c.16.51.36 1.02.59 1.51-.45-.23-.87-.52-1.27-.83M12 20c-.84 0-1.95-1.48-2.55-4h5.1c-.55 2.52-1.71 4-2.55 4m2.89-6h-3.45l3.48-3.48c.04.49.08.98.08 1.48 0 .67-.04 1.34-.11 2m.67 5.15c.47-1 .8-2.06 1-3.15h2.31a8.1 8.1 0 0 1-3.31 3.15M19.74 14h-2.83c.06-.64.09-1.31.09-2s0-1.36-.09-2h2.83a7.75 7.75 0 0 1 0 4M5.67 14H4.26c-.17-.65-.26-1.33-.26-2s.09-1.35.26-2h2.83C7 10.64 7 11.31 7 12v.67l2.07-2.07c.02-.2.01-.4.03-.6h.56l2-2H9.44c.6-2.52 1.71-4 2.55-4 .56 0 1.24.67 1.81 1.86l2.75-2.75c-.24-.12-.48-.24-.74-.35a10.017 10.017 0 0 0-9.39.93 9.98 9.98 0 0 0-3.68 4.49c-.76 1.83-.95 3.84-.57 5.78.18.91.5 1.79.92 2.61l2.56-2.56zm2.77-9.15c-.49 1-.84 2.06-1.05 3.15H5.08a8.1 8.1 0 0 1 3.36-3.15"
          />
    </svg>
  );
});

IcNoInternet.displayName = 'IcNoInternet';
