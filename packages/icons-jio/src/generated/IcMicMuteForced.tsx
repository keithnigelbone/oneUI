import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMicMuteForced = forwardRef<SVGSVGElement, IconComponentProps>(function IcMicMuteForced(
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
            d="M15 20H9c-.27 0-.52.11-.71.29A1 1 0 0 0 8 21c0 .27.11.52.29.71.19.19.44.29.71.29h6c.27 0 .52-.11.71-.29s.29-.44.29-.71-.11-.52-.29-.71A.97.97 0 0 0 15 20m-3-5c.25 0 .5-.04.74-.11A5.997 5.997 0 0 1 15 6.81V5c0-.8-.32-1.56-.88-2.12S12.79 2 12 2s-1.56.32-2.12.88S9 4.21 9 5v7c0 .8.32 1.56.88 2.12S11.21 15 12 15m0 2c-1.33 0-2.6-.53-3.54-1.46A5 5 0 0 1 7 12v-1c0-.27-.11-.52-.29-.71A1 1 0 0 0 6 10c-.27 0-.52.11-.71.29A1 1 0 0 0 5 11v1a7 7 0 0 0 7 7c1.47 0 2.9-.47 4.08-1.32-.74-.25-1.42-.64-2-1.15-.65.3-1.35.47-2.08.47m2-5c0 2.21 1.79 4 4 4 .74 0 1.43-.21 2.02-.57l-5.45-5.45c-.35.59-.57 1.28-.57 2.02m4-4c-.74 0-1.43.21-2.02.57l5.45 5.45c.35-.59.57-1.28.57-2.02 0-2.21-1.79-4-4-4"
          />
    </svg>
  );
});

IcMicMuteForced.displayName = 'IcMicMuteForced';
