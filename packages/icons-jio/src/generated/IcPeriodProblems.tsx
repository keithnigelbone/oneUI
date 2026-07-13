import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPeriodProblems = forwardRef<SVGSVGElement, IconComponentProps>(function IcPeriodProblems(
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
            d="M14.62 16.4a5.47 5.47 0 0 1 0-7.77l.63-.63H6V6a1 1 0 0 1 1-1h1.28a2 2 0 0 0 .72.73A2 2 0 0 0 10 6h4a2 2 0 0 0 1-.27 2 2 0 0 0 .72-.73H17a1 1 0 0 1 1 1 2.7 2.7 0 0 1 .5 0 3 3 0 0 1 1.5.41V6a3 3 0 0 0-3-3h-1.28a2 2 0 0 0-.72-.73A2 2 0 0 0 14 2h-4a2 2 0 0 0-1 .27 2 2 0 0 0-.72.73H7a3 3 0 0 0-3 3v13a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1.23a5.3 5.3 0 0 1-1.5.23 5.45 5.45 0 0 1-3.88-1.6M21 10.05l-1.79-1.76a1 1 0 0 0-1.42 0L16 10.05A3.48 3.48 0 0 0 16 15a3.51 3.51 0 0 0 5 0 3.4 3.4 0 0 0 1-2.46 3.46 3.46 0 0 0-1-2.49"
          />
    </svg>
  );
});

IcPeriodProblems.displayName = 'IcPeriodProblems';
