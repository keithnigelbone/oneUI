import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const FreeSampleFilled = forwardRef<SVGSVGElement, IconComponentProps>(function FreeSampleFilled(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M14.7787 2.70708C15.1692 2.31655 15.8024 2.31655 16.1929 2.70708L21.2933 7.80747C21.6839 8.198 21.6839 8.83116 21.2933 9.22169L19.586 10.929L8.86001 20.1266C8.46328 20.4667 7.8715 20.4441 7.50196 20.0745L7.3425 19.9151L5.76895 21.4886C5.37842 21.8792 4.74526 21.8792 4.35473 21.4886L2.51164 19.6455C2.12112 19.255 2.12112 18.6219 2.51164 18.2313L4.0852 16.6578L3.92588 16.4985C3.55633 16.1289 3.53366 15.5371 3.87386 15.1404L13.0714 4.41442L14.7787 2.70708ZM3.50159 18.9384L4.9305 17.5095L6.49075 19.0698L5.06184 20.4987L3.50159 18.9384Z" fill="currentColor"/>
      <path d="M19.0762 11.4244L12.5762 4.92444L13.4247 4.07591L19.9247 10.5759L19.0762 11.4244Z" fill="white"/>
    </svg>
  );
});

FreeSampleFilled.displayName = 'FreeSampleFilled';
