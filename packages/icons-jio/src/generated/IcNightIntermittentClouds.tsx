import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNightIntermittentClouds = forwardRef<SVGSVGElement, IconComponentProps>(function IcNightIntermittentClouds(
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
            d="M15.17 14.5c.79-.64 1.78-1 2.83-1 .92 0 1.77.29 2.49.77.28-.81.46-1.66.52-2.54a9.98 9.98 0 0 0-5.48-9.61c-.87-.44-1.79.47-1.35 1.34.71 1.41 1.02 3.05.76 4.79-.5 3.43-3.28 6.2-6.7 6.7-1.74.26-3.38-.05-4.79-.76-.87-.44-1.77.49-1.34 1.35a9.96 9.96 0 0 0 7.43 5.38c-.02-.14-.04-.28-.04-.42 0-1.27.68-2.38 1.69-2.99a4.26 4.26 0 0 1 3.99-3.01zm5.32 3.57V18a2.5 2.5 0 0 0-4.58-1.39c-.21-.07-.44-.11-.67-.11-1.24 0-2.25 1.01-2.25 2.25 0 .09.02.17.03.25h-.03c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h7c1.1 0 2-.9 2-2 0-.93-.64-1.71-1.51-1.93zM4.35 12.4c.66.33 1.37.53 2.1.6h1.03c.16-.01.31-.01.47-.03 2.42-.35 4.43-2.3 4.94-4.68a2.496 2.496 0 0 0-4.47-.68c-.21-.07-.44-.11-.67-.11-1.24 0-2.25 1.01-2.25 2.25 0 .09.02.17.03.25H5.5a1.498 1.498 0 0 0-1.22 2.37c.02.01.05.01.07.03"
          />
    </svg>
  );
});

IcNightIntermittentClouds.displayName = 'IcNightIntermittentClouds';
