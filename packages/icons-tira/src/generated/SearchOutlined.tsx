import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const SearchOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function SearchOutlined(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M12 4C15.866 4 19 7.13401 19 11C19 12.7206 18.3775 14.2948 17.3477 15.5137L17.4238 15.5762L20.4238 18.5762L20.501 18.6699C20.6548 18.9028 20.6289 19.2188 20.4238 19.4238C20.2188 19.6289 19.9028 19.6548 19.6699 19.501L19.5762 19.4238L16.5762 16.4238L16.5137 16.3477C15.2948 17.3775 13.7206 18 12 18C8.13401 18 5 14.866 5 11C5 7.13401 8.13401 4 12 4ZM12 5.2002C8.79675 5.2002 6.2002 7.79675 6.2002 11C6.2002 14.2033 8.79675 16.7998 12 16.7998C15.2033 16.7998 17.7998 14.2033 17.7998 11C17.7998 7.79675 15.2033 5.2002 12 5.2002Z" fill="currentColor"/>
    </svg>
  );
});

SearchOutlined.displayName = 'SearchOutlined';
