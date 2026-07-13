import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHdmi = forwardRef<SVGSVGElement, IconComponentProps>(function IcHdmi(
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
            d="M19.23 6H4.77A2.77 2.77 0 0 0 2 8.77v4.45a2.77 2.77 0 0 0 2.77 2.77h.82l1.12 1.12c.56.56 1.32.88 2.12.88h6.34c.8 0 1.56-.32 2.12-.88l1.12-1.12h.82A2.77 2.77 0 0 0 22 13.22V8.77A2.77 2.77 0 0 0 19.23 6m-1.52 5.71A1 1 0 0 1 17 12H7c-.27 0-.52-.11-.71-.29A1 1 0 0 1 6 11c0-.27.11-.52.29-.71A1 1 0 0 1 7 10h10c.27 0 .52.11.71.29s.29.44.29.71-.11.52-.29.71"
          />
    </svg>
  );
});

IcHdmi.displayName = 'IcHdmi';
