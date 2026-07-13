import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCookies(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M22 11.95c-.16.02-.33.05-.5.05-1.3 0-2.44-.63-3.17-1.59-.27.06-.54.09-.83.09-2.21 0-4-1.79-4-4 0-.43.09-.84.21-1.23A4 4 0 0 1 12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zM7.5 16c-.83 0-1.5-.67-1.5-1.5S6.67 13 7.5 13s1.5.67 1.5 1.5S8.33 16 7.5 16m1-5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2M17 17c-.83 0-1.5-.67-1.5-1.5S16.17 14 17 14s1.5.67 1.5 1.5S17.83 17 17 17"
          />
    </Svg>
  );
}
