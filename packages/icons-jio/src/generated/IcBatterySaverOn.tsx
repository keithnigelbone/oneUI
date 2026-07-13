import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBatterySaverOn = forwardRef<SVGSVGElement, IconComponentProps>(function IcBatterySaverOn(
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
            d="M9.69 21.45s.01-.02.02-.03l-.08.07s.04-.02.06-.04M7.5 7a.47.47 0 0 0-.35.15c-.09.1-.15.22-.15.35v5.95C8.41 10.65 11.22 9 14.94 9H15V7.5a.47.47 0 0 0-.15-.35.53.53 0 0 0-.35-.15zM6 7c0-.27.11-.52.29-.71S6.73 6 7 6h1c.27 0 .52-.11.71-.29A1 1 0 0 0 9 5V4h4v1c0 .27.11.52.29.71s.44.29.71.29h1c.27 0 .52.11.71.29.19.19.29.44.29.71v2h2V7c0-.8-.32-1.56-.88-2.12S15.79 4 15 4c0-.53-.21-1.04-.59-1.41S13.53 2 13 2H9c-.53 0-1.04.21-1.41.59S7 3.47 7 4c-.8 0-1.56.32-2.12.88S4 6.21 4 7v12c0 .8.32 1.56.88 2.12S6.21 22 7 22h.37C6.73 21.39 6 20 6 19zm13.98 3.31a.7.7 0 0 0-.26-.23.85.85 0 0 0-.35-.08h-4.33c-4.9 0-7.94 3.07-7.94 8 0 1.87.53 2.89 1.18 3.42.02.01.05.02.08.02h.08c.03 0 .05-.02.07-.04s.03-.04.04-.06c.24-4 2.56-6.86 6.91-8.58.09-.04.18-.06.28-.06s.19.01.28.04.17.08.24.14.13.14.16.22a.58.58 0 0 1 0 .52c-.04.08-.09.16-.16.22s-.15.11-.24.14c-3.99 1.55-5.96 4.13-6.03 7.84 0 .03.02.06.04.09 0 .01 0 .03.02.04 0 0 .03 0 .04.01.03.02.06.04.1.04.29 0 .57-.02.85-.04 5.71-.35 8.35-3.6 8.35-6.63s.64-4.34.65-4.37c.05-.1.08-.21.07-.33 0-.11-.04-.22-.11-.32zM9.94 21.94s.03 0 .04.01c-.01 0-.03 0-.04-.01m-.06-.13s.02.06.04.09c-.02-.03-.04-.06-.04-.09"
          />
    </svg>
  );
});

IcBatterySaverOn.displayName = 'IcBatterySaverOn';
