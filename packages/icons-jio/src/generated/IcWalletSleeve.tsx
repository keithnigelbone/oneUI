import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWalletSleeve = forwardRef<SVGSVGElement, IconComponentProps>(function IcWalletSleeve(
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
            d="M17.28 5H6.72C5.22 5 4 6.22 4 7.72v8.56C4 17.78 5.22 19 6.72 19h10.56c1.5 0 2.72-1.22 2.72-2.72V7.72C20 6.22 18.78 5 17.28 5m.72 8h-3.15c-.42 0-.82.24-.95.63a2.001 2.001 0 0 1-3.8 0c-.13-.39-.54-.63-.95-.63H6v-1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm0-4H6V8c0-.55.45-1 1-1h10c.55 0 1 .45 1 1z"
          />
    </svg>
  );
});

IcWalletSleeve.displayName = 'IcWalletSleeve';
