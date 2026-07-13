import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFolderRequest = forwardRef<SVGSVGElement, IconComponentProps>(function IcFolderRequest(
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
            d="M21.12 6.88C20.56 6.32 19.79 6 19 6h-6.59l-1.12-1.12C10.73 4.32 9.97 4 9.17 4H5c-.8 0-1.56.32-2.12.88S2 6.21 2 7v10c0 .8.32 1.56.88 2.12S4.21 20 5 20h14c.8 0 1.56-.32 2.12-.88S22 17.79 22 17V9c0-.8-.32-1.56-.88-2.12M10.71 11.7l-2 2c-.2.2-.45.29-.71.29s-.51-.1-.71-.29l-2-2a.996.996 0 1 1 1.41-1.41l.29.29V7.99c0-.55.45-1 1-1s1 .45 1 1v2.59l.29-.29a.996.996 0 1 1 1.41 1.41z"
          />
    </svg>
  );
});

IcFolderRequest.displayName = 'IcFolderRequest';
