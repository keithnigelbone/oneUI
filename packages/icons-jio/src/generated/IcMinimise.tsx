import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMinimise = forwardRef<SVGSVGElement, IconComponentProps>(function IcMinimise(
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
                d='M12 2a10 10 0 100 20 10 10 0 000-20zm4 11H8a1 1 0 010-2h8a1 1 0 010 2z'
                fill='currentColor'
              />
    </svg>
  );
});

IcMinimise.displayName = 'IcMinimise';
