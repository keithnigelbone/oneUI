import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWalking = forwardRef<SVGSVGElement, IconComponentProps>(function IcWalking(
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
            d="M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m7 3.68a1 1 0 0 0-1.27-.63c-2.36.79-4.94-1.72-5-1.76a.8.8 0 0 0-.29-.19h-.09A.9.9 0 0 0 12 6h-.08a.7.7 0 0 0-.24.05.4.4 0 0 0-.14.06.3.3 0 0 0-.09 0 20.9 20.9 0 0 0-5.28 5.28 1 1 0 0 0 .28 1.38A.94.94 0 0 0 7 13a1 1 0 0 0 .83-.45A18.5 18.5 0 0 1 11 9.05v3.84a13.72 13.72 0 0 1-4.6 7.31 1 1 0 1 0 1.2 1.6 14.83 14.83 0 0 0 4.79-6.64 28.2 28.2 0 0 1 3.66 6.16A1 1 0 0 0 17 22q.163-.005.32-.05a1 1 0 0 0 .68-1.27c-.92-2.75-4.08-6.91-4.95-8V9a6.4 6.4 0 0 0 5.32.93A1 1 0 0 0 19 8.68"
          />
    </svg>
  );
});

IcWalking.displayName = 'IcWalking';
