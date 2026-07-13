import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTabManager = forwardRef<SVGSVGElement, IconComponentProps>(function IcTabManager(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3"
          />
          <path
            fill="#fff"
            d="M12.643 16h-1.356V9.16q-.408.216-1.008.468a7 7 0 0 1-.96.348V8.788q.444-.144 1.14-.468t1.152-.612h1.032z"
          />
    </svg>
  );
});

IcTabManager.displayName = 'IcTabManager';
