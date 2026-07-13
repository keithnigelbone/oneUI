import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVoWifi = forwardRef<SVGSVGElement, IconComponentProps>(function IcVoWifi(
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
            d="M12.5 15.5c-.55 0-1 .45-1 1V20c0 .55.45 1 1 1s1-.45 1-1v-3.5c0-.55-.45-1-1-1m-2.26-2.47a1 1 0 0 0-1.21.73l-.67 2.67-.91-2.74a1 1 0 0 0-.95-.68c-.43 0-.81.28-.95.68l-.91 2.72-.67-2.65a.99.99 0 0 0-1.21-.72.99.99 0 0 0-.72 1.21l1.51 5.96c.11.43.49.74.93.75.43.05.84-.26.99-.68l1.04-3.12 1.05 3.16a1 1 0 0 0 .95.68h.04c.44-.02.82-.33.93-.76l1.5-6a.995.995 0 0 0-.73-1.21zm-4.16-1.64c.16.37.52.61.92.61s.76-.24.92-.61l3-7a1 1 0 0 0-.52-1.31.99.99 0 0 0-1.31.53L7.01 8.46 4.93 3.61a.994.994 0 1 0-1.83.78l3 7zM21 15c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1m0 .5c-.55 0-1 .45-1 1V20c0 .55.45 1 1 1s1-.45 1-1v-3.5c0-.55-.45-1-1-1M12.5 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1m6 0h-3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1v-2h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-1h2c.55 0 1-.45 1-1s-.45-1-1-1m-2-4v-.5c0-1.65-1.35-3-3-3s-3 1.35-3 3V9c0 1.65 1.35 3 3 3s3-1.35 3-3m-2 0c0 .55-.45 1-1 1s-1-.45-1-1v-.5c0-.55.45-1 1-1s1 .45 1 1z"
          />
    </svg>
  );
});

IcVoWifi.displayName = 'IcVoWifi';
