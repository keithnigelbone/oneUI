import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFertilized = forwardRef<SVGSVGElement, IconComponentProps>(function IcFertilized(
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
            d="M9.56 13a2.6 2.6 0 0 0-1.76.8 2.41 2.41 0 0 0-.8 2.08.5.5 0 0 1-.19.36c-.15.13-.21.14-.54.13a2.57 2.57 0 0 0-2.75 2.35c-.05.33-.06.39-.21.52a1 1 0 0 0 1.3 1.52A2.58 2.58 0 0 0 5.54 19c0-.33.06-.39.21-.52s.22-.13.55-.13a2.58 2.58 0 0 0 1.86-.62c.251-.201.462-.45.62-.73a2.66 2.66 0 0 0 1.42-.76 2 2 0 0 0 .4-2.8A1.44 1.44 0 0 0 9.56 13M14 3a7 7 0 0 0-6.78 8.73A4.33 4.33 0 0 1 9.56 11 3.4 3.4 0 0 1 12 12a3.49 3.49 0 0 1 1 3 4.5 4.5 0 0 1-.69 1.78A7 7 0 1 0 14 3m0 8.5a1.499 1.499 0 1 1 0-2.998 1.499 1.499 0 0 1 0 2.998"
          />
    </svg>
  );
});

IcFertilized.displayName = 'IcFertilized';
