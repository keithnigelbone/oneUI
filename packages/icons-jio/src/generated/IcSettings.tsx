import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSettings = forwardRef<SVGSVGElement, IconComponentProps>(function IcSettings(
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
            d="M20.43 13.4 19 12.58v-1.16l1.43-.82a2 2 0 0 0 .73-2.73l-1-1.74a2 2 0 0 0-2.73-.73l-1.18.68-.25.15-1-.58V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.65l-.25.14-.75.44-.25-.15-1.18-.68a2 2 0 0 0-2.73.73l-1 1.74a2 2 0 0 0 .73 2.73l1.43.82v1.16l-1.43.82a2 2 0 0 0-.73 2.73l1 1.74a2 2 0 0 0 2.73.73L8 17.77l1 .58V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1.65l1-.58 1.43.83a2 2 0 0 0 2.73-.73l1-1.74a2 2 0 0 0-.73-2.73M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
          />
    </svg>
  );
});

IcSettings.displayName = 'IcSettings';
