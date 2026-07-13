import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSunnyPartlyCloudyShowers = forwardRef<SVGSVGElement, IconComponentProps>(function IcSunnyPartlyCloudyShowers(
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
            d="M10 5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1m-5 5c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1m.05-3.54a.996.996 0 1 0 1.41-1.41l-.71-.71a.996.996 0 1 0-1.41 1.41zm0 7.07-.71.71a.996.996 0 1 0 1.41 1.41l.71-.71a.996.996 0 1 0-1.41-1.41m8.49-7.07c.39.39 1.02.39 1.41 0l.71-.71a.996.996 0 1 0-1.41-1.41l-.71.71a.996.996 0 0 0 0 1.41m-.75 2.35c.22-.25.47-.47.74-.68A3.99 3.99 0 0 0 10.01 6c-2.21 0-4 1.79-4 4 0 1.3.63 2.45 1.6 3.18.35-.55.83-1 1.4-1.3.58-1.64 2.03-2.85 3.78-3.07m7.4 2.99C19.85 10.2 18.47 9 16.8 9c-1.3 0-2.42.74-3.01 1.82-.15-.03-.3-.05-.46-.05-1.44 0-2.6 1.19-2.6 2.67-.96 0-1.73.8-1.73 1.78S9.78 17 10.73 17h8.67c1.44 0 2.6-1.19 2.6-2.67 0-1.19-.77-2.19-1.81-2.53m-9.99 6.6-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2m4 0-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2m4 0-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2"
          />
    </svg>
  );
});

IcSunnyPartlyCloudyShowers.displayName = 'IcSunnyPartlyCloudyShowers';
