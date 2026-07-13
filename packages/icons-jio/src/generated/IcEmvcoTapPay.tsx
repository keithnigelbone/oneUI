import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEmvcoTapPay = forwardRef<SVGSVGElement, IconComponentProps>(function IcEmvcoTapPay(
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
            d="M12 4C6.48 4 2 7.58 2 12s4.48 8 10 8 10-3.58 10-8-4.48-8-10-8m-6.12 8.82a1 1 0 0 1-1 .73 1.3 1.3 0 0 1-.28 0 1 1 0 0 1-.6-1.28.75.75 0 0 0 0-.54 1.003 1.003 0 0 1 1.93-.55 2.86 2.86 0 0 1 0 1.64zm3.85 1.1a1 1 0 0 1-1 .73.9.9 0 0 1-.28 0 1 1 0 0 1-.69-1.24 4.8 4.8 0 0 0 0-2.74 1.003 1.003 0 0 1 1.93-.55 7 7 0 0 1 0 3.84zM13.57 15a1 1 0 0 1-1 .73q-.135.015-.27 0a1 1 0 0 1-.69-1.24 8.9 8.9 0 0 0 0-4.94A1.018 1.018 0 0 1 13.57 9a10.8 10.8 0 0 1 0 6m3.84 1.1a1 1 0 0 1-1 .72q-.135.015-.27 0a1 1 0 0 1-.69-1.24 12.75 12.75 0 0 0 0-7.14 1 1 0 0 1 1.447-1.149 1 1 0 0 1 .473.599 14.7 14.7 0 0 1 0 8.24z"
          />
    </svg>
  );
});

IcEmvcoTapPay.displayName = 'IcEmvcoTapPay';
