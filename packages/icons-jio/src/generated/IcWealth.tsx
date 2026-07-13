import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWealth = forwardRef<SVGSVGElement, IconComponentProps>(function IcWealth(
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
            d="M16.76 13.84c-.58.61-1.3 1.09-2.76 1.54v5.12c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-8.04c-.59-.04-1.3-.14-1.7-.32-.58-.23-1.1-.59-1.54-1.04-2.15-2.16-2.15-6.21-2.15-6.38 0-.19.07-.36.2-.49s.29-.21.48-.21c1.63-.15 3.26.32 4.59 1.29 1.33.98 2.54 3.02 2.58 4.78.82-1.42 2.53-1.87 3.86-1.83.18 0 .35.08.48.21s.2.3.2.49c.02 1.89-.07 3.4-1.24 4.88"
          />
          <path
            fill="currentColor"
            d="M16.76 13.84c-.58.61-1.3 1.09-2.76 1.54v5.12c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-8.04c-.59-.04-1.3-.14-1.7-.32-.58-.23-1.1-.59-1.54-1.04-2.15-2.16-2.15-6.21-2.15-6.38 0-.19.07-.36.2-.49s.29-.21.48-.21c1.63-.15 3.26.32 4.59 1.29 1.33.98 2.54 3.02 2.58 4.78.82-1.42 2.53-1.87 3.86-1.83.18 0 .35.08.48.21s.2.3.2.49c.02 1.89-.07 3.4-1.24 4.88"
          />
    </svg>
  );
});

IcWealth.displayName = 'IcWealth';
