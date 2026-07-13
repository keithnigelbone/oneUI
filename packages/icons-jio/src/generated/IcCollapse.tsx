import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCollapse = forwardRef<SVGSVGElement, IconComponentProps>(function IcCollapse(
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
            d="M19.059 9.647h-4.706V4.941c0-.565-.377-.941-.941-.941-.565 0-.941.376-.941.941v5.647c0 .565.376.941.94.941h5.648c.564 0 .941-.376.941-.94 0-.566-.377-.942-.941-.942M10.588 12.47H4.941c-.565 0-.941.377-.941.942 0 .564.376.94.941.94h4.706v4.707c0 .564.377.941.941.941.565 0 .941-.377.941-.941v-5.647c0-.565-.376-.941-.94-.941"
          />
    </svg>
  );
});

IcCollapse.displayName = 'IcCollapse';
