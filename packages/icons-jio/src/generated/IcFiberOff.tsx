import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFiberOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcFiberOff(
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
            d="M19.46 9.25a1.002 1.002 0 0 0 .97.75c.17 0 .34-.05.49-.13s.28-.21.36-.36c.46-.75.7-1.62.7-2.5s-.24-1.75-.7-2.5c-.15-.2-.36-.34-.6-.39s-.49-.01-.71.11a1.01 1.01 0 0 0-.41 1.28c.27.45.42.96.43 1.49a2.9 2.9 0 0 1-.43 1.49c-.14.23-.17.5-.11.76zM13.08 9.87a1.002 1.002 0 0 0 1.46-.62c.07-.25.03-.53-.11-.76-.27-.45-.42-.96-.43-1.49 0-.53.16-1.04.43-1.49a1.008 1.008 0 0 0-.41-1.28.98.98 0 0 0-.71-.11.98.98 0 0 0-.6.39c-.46.75-.7 1.62-.7 2.5s.24 1.75.7 2.5q.135.225.36.36z"
          />
          <path
            fill="currentColor"
            d="M22 17v-2c0-.8-.32-1.56-.88-2.12S19.79 12 19 12h-1V5c0-.27-.11-.52-.29-.71A.97.97 0 0 0 17 4c-.27 0-.52.11-.71.29S16 4.73 16 5v7h-2.58L4.7 3.28a.996.996 0 1 0-1.41 1.41l17 17c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.9-.9c.11-.08.22-.16.32-.26.56-.56.88-1.33.88-2.12zM5 12c-.8 0-1.56.32-2.12.88S2 14.21 2 15v2c0 .8.32 1.56.88 2.12S4.21 20 5 20h10.76l-8-8zm1.71 4.71A1 1 0 0 1 6 17a1.014 1.014 0 0 1-.99-1.2c.04-.19.13-.37.27-.51s.32-.24.51-.27a1.014 1.014 0 0 1 1.2.99c0 .27-.11.52-.29.71zm2.31-.9c.04-.19.13-.37.27-.51s.32-.24.51-.27a1.014 1.014 0 0 1 1.2.99c0 .27-.11.52-.29.71s-.44.29-.71.29a1.014 1.014 0 0 1-.99-1.2z"
          />
    </svg>
  );
});

IcFiberOff.displayName = 'IcFiberOff';
