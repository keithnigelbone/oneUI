import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEducation = forwardRef<SVGSVGElement, IconComponentProps>(function IcEducation(
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
            d="m21.07 7.61-8.5-3.5a1.5 1.5 0 0 0-1.14 0l-8.5 3.5C2.37 7.84 2 8.39 2 9v7c0 .55.45 1 1 1s1-.45 1-1v-5.17l7.43 3.06c.18.08.38.11.57.11s.39-.04.57-.11l8.5-3.5a1.505 1.505 0 0 0 0-2.78M12 16c-.46 0-.91-.09-1.33-.26L6 13.82v3.69c0 .59.36 1.13.9 1.37l4.5 1.96q.285.12.6.12t.6-.12l4.5-1.96c.55-.24.9-.77.9-1.37v-3.69l-4.67 1.92c-.43.18-.87.26-1.33.26"
          />
    </svg>
  );
});

IcEducation.displayName = 'IcEducation';
