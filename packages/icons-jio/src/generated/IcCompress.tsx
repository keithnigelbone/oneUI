import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCompress = forwardRef<SVGSVGElement, IconComponentProps>(function IcCompress(
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
            d="M10.5 12.5h-6c-.55 0-1 .45-1 1s.45 1 1 1h3.59L2.8 19.79a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l5.29-5.29v3.59c0 .55.45 1 1 1s1-.45 1-1v-6c0-.55-.45-1-1-1zm10.71-9.71a.996.996 0 0 0-1.41 0l-5.29 5.29V4.49c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-3.59l5.29-5.29a.996.996 0 0 0 0-1.41"
          />
    </svg>
  );
});

IcCompress.displayName = 'IcCompress';
