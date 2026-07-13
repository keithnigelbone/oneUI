import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSound = forwardRef<SVGSVGElement, IconComponentProps>(function IcSound(
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
            fillRule="evenodd"
            d="M11.06 4.037a1.97 1.97 0 0 1 2.178-.43 1.97 1.97 0 0 1 1.235 1.845v13.215c0 .808-.46 1.51-1.2 1.833a1.98 1.98 0 0 1-2.16-.365l-4.285-3.973h-3.08a2.2 2.2 0 0 1-2.198-2.195l-.05-3.13c0-1.332.825-2.292 1.963-2.292h3.065zm7.797 14.585a.75.75 0 0 1-.577-.273.747.747 0 0 1 .1-1.055c1.59-1.317 2.62-3.362 2.62-5.207 0-1.85-1.028-3.893-2.62-5.208a.747.747 0 0 1-.1-1.055.747.747 0 0 1 1.055-.1C21.257 7.312 22.5 9.81 22.5 12.087c0 2.275-1.243 4.773-3.165 6.363a.73.73 0 0 1-.478.172m-1.927-2.41a.749.749 0 0 1-.44-1.357c.737-.538 1.62-1.453 1.62-2.768s-.88-2.23-1.62-2.767a.75.75 0 0 1-.165-1.048.75.75 0 0 1 1.047-.165c1.443 1.05 2.238 2.463 2.238 3.983s-.795 2.932-2.238 3.982a.77.77 0 0 1-.442.14"
            clipRule="evenodd"
          />
    </svg>
  );
});

IcSound.displayName = 'IcSound';
