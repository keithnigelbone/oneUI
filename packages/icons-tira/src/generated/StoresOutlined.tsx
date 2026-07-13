import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const StoresOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function StoresOutlined(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M5.69231 3C5.27547 3 4.90235 3.25857 4.75598 3.64888L2.50598 9.64888C2.26083 10.3026 2.74411 11 3.44231 11H3.99931V20C3.99931 20.5523 4.44703 21 4.99931 21H18.9993C19.5516 21 19.9993 20.5523 19.9993 20V11H20.5563C21.2545 11 21.7378 10.3026 21.4926 9.64888L19.2426 3.64888C19.0963 3.25857 18.7232 3 18.3063 3H5.69231ZM5.83091 4.2L3.73091 9.8H20.2677L18.1677 4.2H5.83091ZM15.3993 11.0008H8.59932V15.4H15.3993V11.0008ZM16.5993 11.0008V15.4H18.7993V11.0008H16.5993ZM5.19931 16.6V19.8H18.7993V16.6H5.19931ZM5.19931 11.0008H7.39932V15.4H5.19931V11.0008Z" fill="currentColor"/>
    </svg>
  );
});

StoresOutlined.displayName = 'StoresOutlined';
