import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCowProfile = forwardRef<SVGSVGElement, IconComponentProps>(function IcCowProfile(
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
            d="M14 15h-4a3 3 0 0 0 0 6h4a3 3 0 1 0 0-6m4.75-6h-.14A7.3 7.3 0 0 0 21 4a1 1 0 0 0-1.83-.56A11.5 11.5 0 0 1 16.68 6 4.3 4.3 0 0 0 14 5h-4a4.3 4.3 0 0 0-2.68 1 11.5 11.5 0 0 1-2.49-2.56A1 1 0 0 0 3 4a7.3 7.3 0 0 0 2.39 5h-.14A2.25 2.25 0 0 0 3 11.25a.76.76 0 0 0 .75.75h1.5c.379-.002.75-.102 1.08-.29 0 .14.07.28.11.42q.264.987.4 2A5 5 0 0 1 10 13h4a5 5 0 0 1 3.16 1.15q.136-1.014.4-2c0-.14.07-.28.11-.42.33.188.701.288 1.08.29h1.5a.76.76 0 0 0 .75-.75A2.25 2.25 0 0 0 18.75 9M9 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2m6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcCowProfile.displayName = 'IcCowProfile';
