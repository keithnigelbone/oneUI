import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ReduceOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ReduceOutlined(
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
      <path d="M20 11.4004C20.3314 11.4004 20.5996 11.6686 20.5996 12C20.5996 12.3314 20.3314 12.5996 20 12.5996H4C3.66863 12.5996 3.40039 12.3314 3.40039 12C3.40039 11.6686 3.66863 11.4004 4 11.4004H20Z" fill="currentColor"/>
    </svg>
  );
});

ReduceOutlined.displayName = 'ReduceOutlined';
