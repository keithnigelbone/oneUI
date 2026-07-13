import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSkinProblem = forwardRef<SVGSVGElement, IconComponentProps>(function IcSkinProblem(
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
            d="M18.93 10.1a.99.99 0 0 0-1.26.34L15.96 13a.25.25 0 0 1-.46-.14V5c0-.55-.45-1-1-1s-1 .45-1 1v5.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V3c0-.55-.45-1-1-1s-1 .45-1 1v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4c0-.55-.45-1-1-1s-1 .45-1 1v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7c0-.55-.45-1-1-1s-1 .45-1 1v7.99c0 3.71 2.88 6.93 6.59 7.01 3.06.06 5.72-1.88 6.6-4.8l1.77-5.91a1 1 0 0 0-.53-1.19M6.5 15c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5m1 4c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5m0-3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5m0-2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5m2 6c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5m4-3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5m1 2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5m1-3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5"
          />
    </svg>
  );
});

IcSkinProblem.displayName = 'IcSkinProblem';
