import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSetTopBox = forwardRef<SVGSVGElement, IconComponentProps>(function IcSetTopBox(
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
            d="M21.12 8.88C20.56 8.32 19.8 8 19 8H5c-.8 0-1.56.32-2.12.88S2 10.21 2 11v2c0 .8.32 1.56.88 2.12.32.32.7.55 1.12.7v.68c0 .28.23.5.5.5h.99c.28 0 .5-.23.5-.5v-.49h12v.49c0 .28.23.5.5.5h.99c.28 0 .5-.23.5-.5v-.68c.42-.15.8-.38 1.12-.7.56-.56.88-1.33.88-2.12v-2c0-.8-.32-1.56-.88-2.12zm-8.41 3.83A1 1 0 0 1 12 13c-.2 0-.39-.06-.56-.17-.16-.11-.29-.27-.37-.45a.96.96 0 0 1-.06-.58c.04-.19.13-.37.27-.51s.32-.23.51-.27.4-.02.58.06a1.01 1.01 0 0 1 .62.93c0 .27-.11.52-.29.71z"
          />
    </svg>
  );
});

IcSetTopBox.displayName = 'IcSetTopBox';
