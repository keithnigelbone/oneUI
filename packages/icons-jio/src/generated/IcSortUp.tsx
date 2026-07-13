import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSortUp = forwardRef<SVGSVGElement, IconComponentProps>(function IcSortUp(
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
            d="M10 17H4c-.27 0-.52.11-.71.29A1 1 0 0 0 3 18c0 .27.11.52.29.71.19.19.44.29.71.29h6c.27 0 .52-.11.71-.29s.29-.44.29-.71-.11-.52-.29-.71A.97.97 0 0 0 10 17m0-6H4c-.27 0-.52.11-.71.29A1 1 0 0 0 3 12c0 .27.11.52.29.71.19.19.44.29.71.29h6c.27 0 .52-.11.71-.29s.29-.44.29-.71-.11-.52-.29-.71A.97.97 0 0 0 10 11m4.21 4.22 1.29-1.3v4.09c0 .27.11.52.29.71s.44.29.71.29.52-.11.71-.29.29-.44.29-.71v-4.09l1.29 1.3c.19.19.44.29.71.29s.52-.11.71-.29.29-.44.29-.71-.11-.52-.29-.71l-3-3a1 1 0 0 0-.33-.22 1 1 0 0 0-.38-.08c-.13 0-.26.03-.38.08s-.23.13-.33.22l-3 3c-.09.09-.17.2-.22.33-.05.12-.08.25-.08.38s.03.26.08.38a1 1 0 0 0 .55.55c.12.05.25.08.38.08s.26-.03.38-.08.23-.12.33-.22M20 5H4c-.27 0-.52.11-.71.29A1 1 0 0 0 3 6c0 .27.11.52.29.71.19.19.44.29.71.29h16c.27 0 .52-.11.71-.29A1 1 0 0 0 21 6c0-.27-.11-.52-.29-.71A1 1 0 0 0 20 5"
          />
    </svg>
  );
});

IcSortUp.displayName = 'IcSortUp';
