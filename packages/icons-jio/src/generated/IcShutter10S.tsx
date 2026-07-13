import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcShutter10S = forwardRef<SVGSVGElement, IconComponentProps>(function IcShutter10S(
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
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M7.81 15.38c0 .66-.48.87-.98.87s-.98-.21-.98-.87v-4.11s0-.11-.06-.11c-.04 0-.07.02-.11.06-.22.22-.43.3-.64.3-.48 0-1.04-.48-1.04-1 0-.22.1-.46.34-.7l1.79-1.76c.27-.27.57-.31.71-.31.48 0 .97.25.97 1.03zm3.9.87c-2.49 0-2.83-1.92-2.83-4.25s.34-4.25 2.83-4.25 2.82 1.92 2.82 4.25-.34 4.25-2.82 4.25m5.92 0c-.91 0-1.65-.27-2.11-.69-.22-.19-.3-.4-.3-.59 0-.45.41-.94.89-.94.15 0 .3.06.47.17.34.23.68.34 1.05.34.27 0 .46-.11.46-.31 0-.18-.16-.27-.46-.36l-.49-.16c-1.16-.36-1.81-1.04-1.81-1.91 0-1.28.92-1.98 2.31-1.98.51 0 1.16.12 1.63.42.28.17.42.42.42.68 0 .48-.33.92-.82.92-.12 0-.24-.04-.39-.1-.37-.17-.59-.21-.85-.21s-.41.13-.41.28c0 .12.12.22.41.31l.48.17c1.32.46 1.87.97 1.87 1.93 0 1.32-.97 2.03-2.35 2.03"
          />
          <path
            fill="currentColor"
            d="M11.72 9.63c-.76 0-.82.75-.82 2.31v.12c0 1.56.06 2.31.82 2.31s.82-.75.82-2.31v-.11c0-1.57-.06-2.32-.82-2.32"
          />
    </svg>
  );
});

IcShutter10S.displayName = 'IcShutter10S';
