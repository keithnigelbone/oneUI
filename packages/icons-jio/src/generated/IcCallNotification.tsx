import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallNotification = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallNotification(
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
            d="m17.79 16.76-.72-.69c-.38-.37-.88-.58-1.41-.58s-1.04.21-1.41.58l-.71.71c-.09.09-.2.17-.33.22-.12.05-.25.08-.38.08s-.26-.03-.38-.08-.23-.12-.33-.22l-4.21-4.24a1 1 0 0 1-.22-.33 1 1 0 0 1-.08-.38c0-.13.03-.26.08-.38s.12-.23.22-.33l.71-.71c.37-.37.58-.88.58-1.41s-.21-1.04-.58-1.41l-.71-.71a2 2 0 0 0-1.42-.58c-.27 0-.52.05-.77.15-.24.1-.46.25-.65.43l-1 1c-.31.3-.52.7-.57 1.13-.18 1.4-.08 4.74 3.67 8.47s7.07 3.85 8.48 3.68c.43-.05.83-.26 1.13-.57l1-1a2 2 0 0 0 .58-1.42c0-.27-.05-.52-.15-.77-.1-.24-.25-.46-.43-.65zM20.57 8.12h-.44V5.49c0-.93-.37-1.82-1.03-2.47a3.505 3.505 0 0 0-4.96 0c-.66.66-1.03 1.55-1.03 2.47v2.63h-.44c-.12 0-.23.05-.31.13s-.13.19-.13.31.05.23.13.31.19.13.31.13h7.9c.12 0 .23-.05.31-.13s.13-.19.13-.31-.05-.23-.13-.31a.44.44 0 0 0-.31-.13m-3.95 3.19c.35 0 .68-.14.93-.39s.39-.58.39-.93h-2.63c0 .35.14.68.39.93s.58.39.93.39z"
          />
    </svg>
  );
});

IcCallNotification.displayName = 'IcCallNotification';
