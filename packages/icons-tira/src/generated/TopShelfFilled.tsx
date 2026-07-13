import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const TopShelfFilled = forwardRef<SVGSVGElement, IconComponentProps>(function TopShelfFilled(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M15.2235 2.48807C15.8341 2.38414 16.3913 2.85455 16.3913 3.47389V4.23662L18.1335 4.23657C18.6858 4.23656 19.1336 4.68428 19.1336 5.23657V20.5998C19.1336 21.1521 18.6859 21.5998 18.1336 21.5998H5.00039C4.66902 21.5998 4.40039 21.3312 4.40039 20.9998C4.40039 20.928 4.41303 20.859 4.4362 20.7952C4.41289 20.7105 4.40039 20.6211 4.40039 20.5283V5.17455C4.40039 4.68702 4.75196 4.27054 5.23258 4.18873L15.2235 2.48807ZM12.2948 20.3998H17.9336V5.43658L16.3913 5.43662V18.8732C16.3913 19.3624 16.0374 19.7798 15.5548 19.8598L12.2948 20.3998Z" fill="currentColor"/>
      <path d="M11.7281 9.39059C11.3131 9.43881 10.934 9.64949 10.6739 9.97653C10.4138 10.3036 10.2938 10.7203 10.3402 11.1356C10.3316 10.7178 10.1579 10.3205 9.85706 10.0304C9.55622 9.74041 9.15275 9.58137 8.73493 9.58811C8.31985 9.63633 7.94078 9.84702 7.68065 10.1741C7.42053 10.5011 7.30055 10.9179 7.34696 11.3331C7.41405 12.3499 8.535 13.437 9.44121 14.1564C10.1055 14.6838 11.0393 14.6225 11.6287 14.0125C12.4325 13.1808 13.4006 11.9565 13.3334 10.9381C13.3248 10.5203 13.1511 10.1229 12.8503 9.83291C12.5494 9.54289 12.146 9.38385 11.7281 9.39059Z" fill="white"/>
    </svg>
  );
});

TopShelfFilled.displayName = 'TopShelfFilled';
