import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcQrCode = forwardRef<SVGSVGElement, IconComponentProps>(function IcQrCode(
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
                d='M7 15H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm5-6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm7-6h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 9h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2zm14 2h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm1 8h-7v-6c0-1.1-.9-2-2-2H4c-.55 0-1 .45-1 1s.45 1 1 1h7v6c0 1.1.9 2 2 2h7c.55 0 1-.45 1-1s-.45-1-1-1z'
                fill='currentColor'
              />
    </svg>
  );
});

IcQrCode.displayName = 'IcQrCode';
