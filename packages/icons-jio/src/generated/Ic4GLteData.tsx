import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const Ic4GLteData = forwardRef<SVGSVGElement, IconComponentProps>(function Ic4GLteData(
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
            d="M5 10h3v1c0 .55.45 1 1 1s1-.45 1-1v-1c.55 0 1-.45 1-1s-.45-1-1-1V7c0-.55-.45-1-1-1s-1 .45-1 1v1H6.48l1.45-3.63a.994.994 0 0 0-.56-1.3.99.99 0 0 0-1.3.56l-2 5c-.12.31-.09.66.1.93s.5.44.83.44m10.75 2c2.07 0 3.75-1.68 3.75-3.75V7.5c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1h.98c-.12.85-.85 1.5-1.73 1.5-.96 0-1.75-.79-1.75-1.75v-1.5c0-.96.79-1.75 1.75-1.75.41 0 .8.14 1.11.4.43.35 1.06.29 1.41-.13.35-.43.29-1.06-.13-1.41-.67-.55-1.52-.86-2.39-.86C13.68 3 12 4.68 12 6.75v1.5c0 2.07 1.68 3.75 3.75 3.75M8 19H6v-5c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1m5.5-6h-5c-.55 0-1 .45-1 1s.45 1 1 1H10v5c0 .55.45 1 1 1s1-.45 1-1v-5h1.5c.55 0 1-.45 1-1s-.45-1-1-1m5.5 6h-2v-1h1.25c.55 0 1-.45 1-1s-.45-1-1-1H17v-1h2c.55 0 1-.45 1-1s-.45-1-1-1h-3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </svg>
  );
});

Ic4GLteData.displayName = 'Ic4GLteData';
