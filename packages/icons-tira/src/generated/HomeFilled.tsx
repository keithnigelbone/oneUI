import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const HomeFilled = forwardRef<SVGSVGElement, IconComponentProps>(function HomeFilled(
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
      <path d="M13.2985 3.25785C12.5367 2.71553 11.5153 2.71406 10.752 3.25417L4.29065 7.82577C3.7078 8.23815 3.36133 8.90773 3.36133 9.6217V19.0001C3.36133 20.436 4.52539 21.6001 5.96133 21.6001H8.06681C9.28184 21.6001 10.2668 20.6151 10.2668 19.4001V16.9316C10.2668 16.3793 10.7145 15.9316 11.2668 15.9316H12.7695C13.3218 15.9316 13.7695 16.3793 13.7695 16.9316V19.4001C13.7695 20.6151 14.7545 21.6001 15.9695 21.6001H18.0404C19.4764 21.6001 20.6404 20.436 20.6404 19.0001V9.61877C20.6404 8.90704 20.2961 8.23928 19.7163 7.82652L13.2985 3.25785Z" fill="currentColor"/>
    </svg>
  );
});

HomeFilled.displayName = 'HomeFilled';
