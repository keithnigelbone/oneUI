import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcExpand = forwardRef<SVGSVGElement, IconComponentProps>(function IcExpand(
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
            d="M19.111 4h-5.333c-.534 0-.89.356-.89.889s.356.889.89.889h4.444v4.444c0 .534.356.89.89.89.532 0 .888-.356.888-.89V4.89c0-.533-.356-.889-.889-.889M10.222 18.222H5.778v-4.444c0-.534-.356-.89-.89-.89-.532 0-.888.356-.888.89v5.333c0 .533.356.889.889.889h5.333c.534 0 .89-.356.89-.889s-.356-.889-.89-.889"
          />
    </svg>
  );
});

IcExpand.displayName = 'IcExpand';
