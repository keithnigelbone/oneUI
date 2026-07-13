import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CouponFilled = forwardRef<SVGSVGElement, IconComponentProps>(function CouponFilled(
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
      <path d="M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V10.0757C22 10.3244 21.7488 10.5 21.5 10.5C20.6716 10.5 20 11.1716 20 12C20 12.8284 20.6716 13.5 21.5 13.5C21.7488 13.5 22 13.6756 22 13.9243V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V13.9243C2 13.6756 2.25125 13.5 2.5 13.5C3.32843 13.5 4 12.8284 4 12C4 11.1716 3.32843 10.5 2.5 10.5C2.25125 10.5 2 10.3244 2 10.0757V7Z" fill="currentColor"/>
      <path d="M11.0001 9.5C11.0001 10.3284 10.3285 11 9.50006 11C8.67163 11 8.00006 10.3284 8.00006 9.5C8.00006 8.67157 8.67163 8 9.50006 8C10.3285 8 11.0001 8.67157 11.0001 9.5Z" fill="white"/>
      <path d="M15.4326 8.57564C15.6669 8.80995 15.6669 9.18985 15.4326 9.42417L9.43262 15.4242C9.19831 15.6585 8.81841 15.6585 8.58409 15.4242C8.34978 15.1899 8.34978 14.81 8.58409 14.5756L14.5841 8.57564C14.8184 8.34132 15.1983 8.34132 15.4326 8.57564Z" fill="white"/>
      <path d="M16.0001 14.5C16.0001 15.3284 15.3285 16 14.5001 16C13.6716 16 13.0001 15.3284 13.0001 14.5C13.0001 13.6716 13.6716 13 14.5001 13C15.3285 13 16.0001 13.6716 16.0001 14.5Z" fill="white"/>
    </svg>
  );
});

CouponFilled.displayName = 'CouponFilled';
