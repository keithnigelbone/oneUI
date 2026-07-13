import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifiNoInternet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.12 14.88a1 1 0 0 0-1.41 0l-.71.71-.71-.71a1 1 0 0 0-1.41 1.41l.71.71-.71.71a1 1 0 0 0 1.41 1.41l.71-.71.71.71a1 1 0 0 0 1.41-1.41l-.71-.71.71-.71a1 1 0 0 0 0-1.41m1.48-6.52A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44A2 2 0 0 0 12 20a2 2 0 0 0 1.45-.62l.12-.13A4.9 4.9 0 0 1 13 17a5 5 0 0 1 5-5c.69.005 1.372.155 2 .44l1.42-1.5a2 2 0 0 0 .18-2.58"
          />
    </Svg>
  );
}
