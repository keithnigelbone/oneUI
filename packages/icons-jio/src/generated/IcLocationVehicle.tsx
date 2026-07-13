import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLocationVehicle = forwardRef<SVGSVGElement, IconComponentProps>(function IcLocationVehicle(
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
            d="M8 3c-1.24-.03-2.44.43-3.34 1.29-.9.85-1.42 2.03-1.46 3.27 0 3.05 3.55 6.69 3.96 7.09.22.22.53.35.85.35s.62-.13.85-.35c.41-.4 3.96-4.04 3.96-7.09a4.66 4.66 0 0 0-1.46-3.27c-.9-.85-2.1-1.32-3.34-1.29zm0 6.6c-.36 0-.7-.11-1-.3-.3-.2-.53-.48-.66-.81-.14-.33-.17-.69-.1-1.04s.24-.67.49-.92.57-.42.92-.49.71-.03 1.04.1c.33.14.61.37.81.66.2.3.3.64.3 1 0 .48-.19.94-.53 1.27s-.8.53-1.27.53"
          />
          <path
            fill="currentColor"
            d="M20.71 13.96c-.19-.28-.45-.5-.76-.62l-1.16-3.49c-.18-.5-.5-.93-.94-1.23-.43-.3-.95-.47-1.48-.47h-1.61c-.05.56-.18 1.11-.35 1.66h2.01c.19 0 .37.04.52.15.15.1.27.26.33.43l.85 2.82h-5.47c-1 1.44-2.04 2.51-2.4 2.87-.6.6-1.41.93-2.26.93s-1.65-.33-2.25-.92c-.26-.26-.9-.91-1.61-1.81-.08.2-.14.41-.14.63v2.55c0 .3.08.59.23.84.15.26.36.47.62.62v1.09a.857.857 0 0 0 .85.85.857.857 0 0 0 .85-.85v-.85h11.9v.85a.857.857 0 0 0 .85.85.857.857 0 0 0 .85-.85v-1.09c.26-.15.47-.36.62-.62s.23-.55.23-.84v-2.55c0-.33-.1-.66-.29-.94zm-2.51 2.38a.85.85 0 0 1-1.08.11.82.82 0 0 1-.31-.38c-.07-.15-.09-.31-.07-.48.03-.17.11-.32.23-.45.12-.12.28-.2.45-.23a.9.9 0 0 1 .49.05c.16.06.29.17.38.31a.852.852 0 0 1-.11 1.08z"
          />
    </svg>
  );
});

IcLocationVehicle.displayName = 'IcLocationVehicle';
