import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMobileReceive = forwardRef<SVGSVGElement, IconComponentProps>(function IcMobileReceive(
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
            d="M17.12 2.88C16.56 2.32 15.79 2 15 2H9c-.8 0-1.56.32-2.12.88S6 4.21 6 5v14c0 .8.32 1.56.88 2.12S8.21 22 9 22h6c.8 0 1.56-.32 2.12-.88S18 19.79 18 19V5c0-.8-.32-1.56-.88-2.12m-4.24 16.76c-.23.23-.55.37-.88.37-.25 0-.49-.07-.69-.21-.21-.14-.37-.33-.46-.56a1.27 1.27 0 0 1-.07-.72c.05-.24.17-.47.34-.64s.4-.29.64-.34.49-.02.72.07.42.25.56.46.21.45.21.69c0 .33-.13.65-.37.88m1.82-6.94-2 2c-.09.09-.2.17-.33.22-.12.05-.25.08-.38.08s-.26-.03-.38-.08-.23-.12-.33-.22l-2-2a.996.996 0 1 1 1.41-1.41l.29.29V4.99c0-.55.45-1 1-1s1 .45 1 1v6.59l.29-.29a.996.996 0 1 1 1.41 1.41z"
          />
    </svg>
  );
});

IcMobileReceive.displayName = 'IcMobileReceive';
