import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSleepApnea = forwardRef<SVGSVGElement, IconComponentProps>(function IcSleepApnea(
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
            d="M10 17H5c0 1.1.9 2 2 2h2v1c0 1.1.9 2 2 2h1v-3c0-1.1-.9-2-2-2m3-14.99C8.68 2 5.15 5.45 5.01 9.74L3.1 13.56a.993.993 0 0 0 .45 1.34l.21.11H10c2.21 0 4 1.79 4 4v3h2c1.1 0 2-.9 2-2v-3.76c1.83-1.47 3-3.72 3-6.24 0-4.41-3.59-8-8-8m.3 7.99c.12 0 .24.05.33.15s.14.22.14.35a.5.5 0 0 1-.47.5h-1.85c-.09 0-.18-.03-.26-.09a.53.53 0 0 1-.2-.51c.02-.1.06-.19.13-.25L12.17 9h-.73c-.12 0-.24-.05-.33-.15a.5.5 0 0 1-.14-.35.5.5 0 0 1 .47-.5h1.85c.1 0 .19.02.28.07.08.06.15.14.18.24.03.09.04.2.01.29-.02.1-.08.18-.15.25L12.56 10h.74m3.56-2.15c-.09.09-.2.15-.33.15h-1.85c-.09 0-.18-.03-.26-.09a.53.53 0 0 1-.2-.51c.02-.1.06-.19.13-.25L15.4 6h-.73c-.12 0-.24-.05-.33-.15a.52.52 0 0 1-.14-.35.5.5 0 0 1 .47-.5h1.85c.09 0 .18.03.26.09a.53.53 0 0 1 .2.51c-.02.1-.06.19-.13.25L15.8 7h.73c.12 0 .24.05.33.15a.5.5 0 0 1 .14.35.5.5 0 0 1-.14.35"
          />
    </svg>
  );
});

IcSleepApnea.displayName = 'IcSleepApnea';
