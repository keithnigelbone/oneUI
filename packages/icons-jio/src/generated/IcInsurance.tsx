import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcInsurance = forwardRef<SVGSVGElement, IconComponentProps>(function IcInsurance(
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
            d="M19.02 6.29c-.28-.33-.66-.53-1.07-.57-1.83-.19-3.61-.72-5.26-1.55-.21-.11-.45-.16-.68-.16s-.47.05-.68.16C9.69 5 7.92 5.53 6.1 5.72c-.41.04-.81.23-1.09.54-.29.31-.46.72-.47 1.16v4.25c0 5.72 5.6 9.34 7.46 9.34s7.46-3.61 7.46-9.34V7.42c0-.41-.17-.82-.45-1.12h.01z"
          />
    </svg>
  );
});

IcInsurance.displayName = 'IcInsurance';
