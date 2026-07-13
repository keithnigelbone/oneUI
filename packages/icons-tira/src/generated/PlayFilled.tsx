import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const PlayFilled = forwardRef<SVGSVGElement, IconComponentProps>(function PlayFilled(
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
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
      <path d="M8.875 8.53592C8.875 7.76611 9.70833 7.28499 10.375 7.66989L16.375 11.134C17.0417 11.5189 17.0417 12.4811 16.375 12.866L10.375 16.3301C9.70833 16.715 8.875 16.2339 8.875 15.4641V8.53592Z" fill="white"/>
    </svg>
  );
});

PlayFilled.displayName = 'PlayFilled';
