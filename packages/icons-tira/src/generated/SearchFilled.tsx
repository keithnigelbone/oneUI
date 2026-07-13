import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const SearchFilled = forwardRef<SVGSVGElement, IconComponentProps>(function SearchFilled(
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
      <path d="M16.9256 17.7741C15.3425 19.1601 13.2694 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11C20 13.2693 19.1601 15.3425 17.7742 16.9256L21.4243 20.5756C21.6586 20.8099 21.6586 21.1898 21.4243 21.4242C21.19 21.6585 20.8101 21.6585 20.5757 21.4242L16.9256 17.7741Z" fill="currentColor"/>
    </svg>
  );
});

SearchFilled.displayName = 'SearchFilled';
