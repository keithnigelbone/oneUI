import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCancer = forwardRef<SVGSVGElement, IconComponentProps>(function IcCancer(
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
            d="M6.16 19.08 8 20l.97 1.93 1.62-1.62-2.83-2.83zM9 9c0-.8.31-1.55.88-2.12A3 3 0 0 1 12 6c.77 0 1.54.29 2.12.88.57.57.88 1.32.88 2.12s-.31 1.55-.88 2.12l-.71.71 2.83 2.83.71-.71a7.007 7.007 0 0 0 0-9.9 7.007 7.007 0 0 0-9.9 0 7.007 7.007 0 0 0 0 9.9l7.98 7.98L16 20l1.84-.92-7.96-7.96C9.31 10.55 9 9.8 9 9"
          />
    </svg>
  );
});

IcCancer.displayName = 'IcCancer';
