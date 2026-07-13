import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVpnData = forwardRef<SVGSVGElement, IconComponentProps>(function IcVpnData(
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
            d="M20.46 4.68c-.34-.37-.8-.6-1.3-.66-2.2-.23-4.35-.85-6.34-1.83-.26-.13-.54-.19-.82-.19s-.56.07-.82.19c-1.97.98-4.11 1.6-6.3 1.83-.5.04-.97.27-1.32.64s-.55.85-.56 1.36v4.99C3 17.75 9.75 22 12 22s9-4.25 9-10.99V6.02c-.01-.5-.2-.97-.54-1.34M8.97 9.17l-1.75 5c-.07.2-.26.33-.47.33s-.4-.13-.47-.33l-1.75-5c-.09-.26.05-.55.31-.64s.55.05.64.31l1.28 3.65 1.28-3.65c.09-.26.38-.4.64-.31s.4.38.31.64zM12.25 12H11v2c0 .28-.22.5-.5.5s-.5-.22-.5-.5V9c0-.28.22-.5.5-.5h1.75c.96 0 1.75.79 1.75 1.75S13.21 12 12.25 12M19 14c0 .22-.15.42-.37.48-.04.01-.09.02-.13.02-.17 0-.34-.09-.43-.24L16 10.81v3.2c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-5c0-.22.15-.42.37-.48.21-.06.45.03.56.22L18 12.2V9c0-.28.22-.5.5-.5s.5.22.5.5zm-6.75-4.5H11V11h1.25c.41 0 .75-.34.75-.75s-.34-.75-.75-.75"
          />
    </svg>
  );
});

IcVpnData.displayName = 'IcVpnData';
