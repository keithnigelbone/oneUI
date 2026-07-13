import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const StoresFilled = forwardRef<SVGSVGElement, IconComponentProps>(function StoresFilled(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M18.4601 3.01172C18.8126 3.06652 19.1141 3.30718 19.2423 3.64844L21.4923 9.64844C21.7221 10.2612 21.312 10.913 20.6847 10.9922L20.5558 11H19.9991V20C19.9991 20.5523 19.5514 21 18.9991 21H4.99913C4.96453 21 4.9303 20.9986 4.8966 20.9951C4.39253 20.9437 3.99913 20.5176 3.99913 20V11H3.44249L3.31359 10.9922C2.68632 10.913 2.27622 10.2612 2.50597 9.64844L4.75597 3.64844C4.88412 3.3072 5.18574 3.06657 5.5382 3.01172L5.69249 3H18.3058L18.4601 3.01172ZM3.73058 9.7998H20.2677L18.1681 4.2002H5.83019L3.73058 9.7998Z" fill="currentColor"/>
      <path d="M15.9993 10.4004C16.3306 10.4004 16.5989 10.6686 16.5989 11V15.4004H18.9993C19.3306 15.4004 19.5989 15.6686 19.5989 16C19.5989 16.3314 19.3306 16.5996 18.9993 16.5996H4.99927C4.6679 16.5996 4.39967 16.3314 4.39967 16C4.39967 15.6686 4.6679 15.4004 4.99927 15.4004H7.39967V11C7.39967 10.6686 7.6679 10.4004 7.99927 10.4004C8.33065 10.4004 8.59888 10.6686 8.59888 11V15.4004H15.3997V11C15.3997 10.6686 15.6679 10.4004 15.9993 10.4004Z" fill="white"/>
    </svg>
  );
});

StoresFilled.displayName = 'StoresFilled';
