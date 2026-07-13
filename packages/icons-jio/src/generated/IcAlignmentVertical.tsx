import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAlignmentVertical = forwardRef<SVGSVGElement, IconComponentProps>(function IcAlignmentVertical(
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
            d="M15 17h-2V7h2a1.002 1.002 0 0 0 .7-1.71l-3-3a.996.996 0 0 0-1.41 0l-3 3c-.29.29-.37.72-.22 1.09s.52.62.92.62h2v10h-2a1.002 1.002 0 0 0-.7 1.71l3 3c.2.2.45.29.71.29s.51-.1.71-.29l3-3c.29-.29.37-.72.22-1.09s-.52-.62-.92-.62z"
          />
    </svg>
  );
});

IcAlignmentVertical.displayName = 'IcAlignmentVertical';
