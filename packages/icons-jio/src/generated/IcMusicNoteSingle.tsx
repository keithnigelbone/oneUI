import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMusicNoteSingle = forwardRef<SVGSVGElement, IconComponentProps>(function IcMusicNoteSingle(
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
            d="M17.79 6.713c.008.296-.08.592-.256.832a1.35 1.35 0 0 1-.712.495l-3.678 1v7.636a3.32 3.32 0 0 1-2.047 3.07 3.35 3.35 0 0 1-1.918.192 3.3 3.3 0 0 1-1.704-.912 3.32 3.32 0 0 1-.72-3.622 3.28 3.28 0 0 1 1.224-1.487 3.3 3.3 0 0 1 1.847-.56c.224 0 .448.025.664.064V6.713c-.008-.296.08-.591.256-.831.175-.24.431-.416.711-.496l4.646-1.335c.2-.056.4-.064.6-.032.2.04.391.12.551.24.168.12.296.287.392.471s.144.392.144.592z"
          />
    </svg>
  );
});

IcMusicNoteSingle.displayName = 'IcMusicNoteSingle';
