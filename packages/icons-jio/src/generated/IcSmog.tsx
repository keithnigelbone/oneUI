import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmog = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmog(
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
            d="M8.71 5.13c.39-.39.44-.41 1.24.12.76.51 2.18 1.46 3.76-.12.39-.39.44-.41 1.24.12.45.3 1.12.75 1.92.75.56 0 1.19-.22 1.84-.87a.996.996 0 1 0-1.41-1.41c-.39.39-.44.41-1.24-.12-.76-.51-2.18-1.46-3.76.12-.39.39-.44.41-1.24-.12-.76-.51-2.18-1.46-3.76.12a.996.996 0 1 0 1.41 1.41m11.85 4.59L16.01 12v-1.48c0-.72-.73-1.2-1.39-.92L9.01 12v-1.48c0-.72-.73-1.2-1.39-.92l-1.61.69V4c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v7.61c-.61.36-1 .99-1 1.71V19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8.38c0-.74-.78-1.23-1.45-.89zM12.01 17h-2v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2z"
          />
    </svg>
  );
});

IcSmog.displayName = 'IcSmog';
