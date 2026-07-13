import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CopyFilled = forwardRef<SVGSVGElement, IconComponentProps>(function CopyFilled(
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
      <path d="M2.00586 4.62002C2.00586 3.18408 3.16992 2.02002 4.60586 2.02002H14.6059C16.0418 2.02002 17.2059 3.18408 17.2059 4.62002V6.38659C17.2059 6.71796 16.9372 6.98659 16.6059 6.98659C16.2745 6.98659 16.0059 6.71796 16.0059 6.38659V4.62002C16.0059 3.84682 15.3791 3.22002 14.6059 3.22002H4.60586C3.83266 3.22002 3.20586 3.84682 3.20586 4.62002V14.62C3.20586 15.3932 3.83266 16.02 4.60586 16.02H6.38399C6.71536 16.02 6.98399 16.2886 6.98399 16.62C6.98399 16.9514 6.71536 17.22 6.38399 17.22H4.60586C3.16992 17.22 2.00586 16.056 2.00586 14.62V4.62002Z" fill="currentColor"/>
      <path d="M7.99936 10C7.99936 8.89543 8.89479 8 9.99936 8H19.9994C21.1039 8 21.9994 8.89543 21.9994 10V20C21.9994 21.1046 21.1039 22 19.9994 22H9.99936C8.89479 22 7.99936 21.1046 7.99936 20V10Z" fill="currentColor"/>
    </svg>
  );
});

CopyFilled.displayName = 'CopyFilled';
