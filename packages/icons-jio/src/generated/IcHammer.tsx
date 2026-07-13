import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHammer = forwardRef<SVGSVGElement, IconComponentProps>(function IcHammer(
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
            d="m21.71 11.29-.71-.7a2 2 0 0 0-1.41-.59H19a3 3 0 0 0-.7-3.12l-3.59-3.59a3.84 3.84 0 0 0-5.42 0 1 1 0 0 0 0 1.42l1 1a1.81 1.81 0 0 1 0 2.58 1 1 0 0 0 0 1.42l2.59 2.58A3 3 0 0 0 16 13v.6a2 2 0 0 0 .59 1.4l.7.71a1 1 0 0 0 1.42 0l3-3a1 1 0 0 0 0-1.42m-12.26.4-5.86 5.85A2 2 0 0 0 4.75 21H5a2 2 0 0 0 1.49-.66l5.56-6.11a6 6 0 0 1-.62-.52z"
          />
    </svg>
  );
});

IcHammer.displayName = 'IcHammer';
