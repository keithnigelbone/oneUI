import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBankMainBranch = forwardRef<SVGSVGElement, IconComponentProps>(function IcBankMainBranch(
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
      <path
            fill="currentColor"
            d="m21.63 6.1-9-3a2.1 2.1 0 0 0-1.26 0l-9 3A2 2 0 0 0 3 10v9a1 1 0 0 0 0 2h18a1 1 0 1 0 0-2v-9a2 2 0 0 0 .63-3.9M11 10v9H9v-9zm2 0h2v9h-2zm-8 0h2v9H5zm14 9h-2v-9h2z"
          />
    </svg>
  );
});

IcBankMainBranch.displayName = 'IcBankMainBranch';
