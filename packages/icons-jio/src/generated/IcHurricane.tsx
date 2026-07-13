import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHurricane = forwardRef<SVGSVGElement, IconComponentProps>(function IcHurricane(
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
            d="M19.76 3.7c.4-.25.24-.86-.22-.92-9-1.11-13.58 3.4-14.39 7.8 0 .02 0 .04-.01.06-.03.19-.07.39-.09.58-.03.26-.05.52-.05.78 0 1.94.79 3.7 2.07 4.97L7 17s0 1.56-2.76 3.3c-.4.25-.24.86.22.92 9 1.11 13.58-3.4 14.39-7.8 0-.02 0-.04.01-.06.03-.19.07-.39.09-.58.03-.26.05-.52.05-.78 0-1.94-.79-3.7-2.07-4.97L17 7s0-1.56 2.76-3.3M12 15c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3"
          />
    </svg>
  );
});

IcHurricane.displayName = 'IcHurricane';
