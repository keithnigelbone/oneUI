import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const UnlockFilled = forwardRef<SVGSVGElement, IconComponentProps>(function UnlockFilled(
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
      <path d="M10.8557 4.41318C11.611 4.17229 12.4231 4.17595 13.1761 4.42366C13.9292 4.67136 14.5849 5.15047 15.0498 5.79268C15.5145 6.43483 15.7648 7.2073 15.7648 8H7C5.89543 8 5 8.89543 5 10V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V10C19 8.89543 18.1046 8 17 8H16.9648C16.9648 6.95462 16.6348 5.93593 16.0219 5.08909C15.4089 4.24219 14.5442 3.61039 13.5511 3.28373C12.558 2.95708 11.4871 2.95225 10.4911 3.26993C9.49502 3.5876 8.62469 4.21157 8.00409 5.05291C7.80738 5.31958 7.8641 5.69522 8.13077 5.89193C8.39745 6.08864 8.77309 6.03192 8.96979 5.76525C9.4404 5.12725 10.1004 4.65408 10.8557 4.41318Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12.5732 14.5975C13.1173 14.3723 13.5 13.8363 13.5 13.2109C13.5 12.3825 12.8284 11.7109 12 11.7109C11.1716 11.7109 10.5 12.3825 10.5 13.2109C10.5 13.8911 10.9527 14.4655 11.5732 14.6494V16.2888C11.5732 16.565 11.7971 16.7888 12.0732 16.7888C12.3494 16.7888 12.5732 16.565 12.5732 16.2888V14.5975ZM12.5 13.2109C12.5 13.4871 12.2761 13.7109 12 13.7109C11.7239 13.7109 11.5 13.4871 11.5 13.2109C11.5 12.9348 11.7239 12.7109 12 12.7109C12.2761 12.7109 12.5 12.9348 12.5 13.2109Z" fill="white"/>
    </svg>
  );
});

UnlockFilled.displayName = 'UnlockFilled';
