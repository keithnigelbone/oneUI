import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBladder = forwardRef<SVGSVGElement, IconComponentProps>(function IcBladder(
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
            d="M14.4 13.44c-.65-.24-1.21-.44-2.41-.44s-1.76.2-2.41.44c-.72.26-1.54.56-3.09.56-.28 0-.52-.01-.76-.03 1.17 2.16 3.5 3.35 5.26 3.83V20c0 .55.45 1 1 1s1-.45 1-1v-2.2c1.76-.48 4.1-1.66 5.26-3.83-.24.02-.49.03-.77.03-1.55 0-2.37-.3-3.09-.56zM20 3c-.55 0-1 .45-1 1v2c0 .8-.48 1.49-1.16 1.81C16.71 6.62 14.77 6 12 6s-4.72.61-5.84 1.81A2.01 2.01 0 0 1 5 6V4c0-.55-.45-1-1-1s-1 .45-1 1v2c0 1.56.9 2.89 2.2 3.55-.12.45-.2.92-.2 1.45 0 .3.02.58.06.86.38.08.82.14 1.43.14 1.2 0 1.76-.2 2.41-.44.72-.26 1.54-.56 3.09-.56s2.37.3 3.09.56c.65.24 1.21.44 2.41.44.62 0 1.07-.05 1.44-.14.04-.28.06-.56.06-.86 0-.53-.08-1-.2-1.45 1.3-.66 2.2-2 2.2-3.55V4c0-.55-.45-1-1-1z"
          />
    </svg>
  );
});

IcBladder.displayName = 'IcBladder';
