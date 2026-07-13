import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const LikeFilled = forwardRef<SVGSVGElement, IconComponentProps>(function LikeFilled(
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
      <path d="M11.4413 3.57812C11.1451 3.57812 10.8769 3.75364 10.7584 4.02517L7.77303 10.8637H6.00039C4.56445 10.8637 3.40039 12.0277 3.40039 13.4637V17.8219C3.40039 19.2579 4.56445 20.4219 6.00039 20.4219H16.6845C17.9576 20.4219 19.0434 19.5001 19.25 18.2438L20.2101 12.4063C20.4704 10.8232 19.2489 9.38438 17.6445 9.38438H14.4611V6.59793C14.4611 4.93014 13.1091 3.57812 11.4413 3.57812Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.57652 20.4209L6.57662 10.8324L7.77662 10.8325L7.77652 20.4209L6.57652 20.4209Z" fill="white"/>
    </svg>
  );
});

LikeFilled.displayName = 'LikeFilled';
