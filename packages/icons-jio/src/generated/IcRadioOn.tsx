import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRadioOn = forwardRef<SVGSVGElement, IconComponentProps>(function IcRadioOn(
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
      <g fill="currentColor" clipPath="url(#ic_radio_on_svg__a)">
            <path d="M12 0C5.38 0 0 5.38 0 12s5.38 12 12 12 12-5.38 12-12S18.62 0 12 0m0 21.6c-5.3 0-9.6-4.3-9.6-9.6S6.7 2.4 12 2.4s9.6 4.3 9.6 9.6-4.3 9.6-9.6 9.6" />
            <path d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6" />
          </g>
          <defs>
            <clipPath id="ic_radio_on_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
    </svg>
  );
});

IcRadioOn.displayName = 'IcRadioOn';
