import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const TiraLovesFilled = forwardRef<SVGSVGElement, IconComponentProps>(function TiraLovesFilled(
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
      <path d="M5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5C14.5 9.98528 12.4853 12 10 12C7.51472 12 5.5 9.98528 5.5 7.5Z" fill="currentColor"/>
      <path d="M20.4985 7.5C20.0812 7.52079 19.689 7.70606 19.4079 8.01525C19.1592 8.28892 19.0153 8.63994 18.9986 9.00642C18.982 8.63994 18.8381 8.28892 18.5893 8.01525C18.3083 7.70606 17.9161 7.52079 17.4988 7.5C17.0814 7.52079 16.6893 7.70606 16.4082 8.01525C16.1271 8.32445 15.98 8.73241 15.9989 9.14985C15.9989 10.1688 17.0459 11.3273 17.9027 12.1049C18.5309 12.6748 19.4666 12.6752 20.095 12.1054C20.9518 11.3284 21.9984 10.1704 21.9984 9.14985C22.0173 8.73241 21.8702 8.32445 21.5891 8.01525C21.308 7.70606 20.9159 7.52079 20.4985 7.5Z" fill="currentColor"/>
      <path d="M17 17C17 20.0563 13.866 20.5 10 20.5C6.13401 20.5 3 20.0563 3 17C3 13.9437 6.13401 13.5 10 13.5C13.866 13.5 17 13.9437 17 17Z" fill="currentColor"/>
    </svg>
  );
});

TiraLovesFilled.displayName = 'TiraLovesFilled';
