import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifiNetwork(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.6 8.36A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44A2 2 0 0 0 12 20a2 2 0 0 0 1.45-.62l.12-.13A4.9 4.9 0 0 1 13 17a5 5 0 0 1 5-5c.69.005 1.372.155 2 .44l1.42-1.5a2 2 0 0 0 .18-2.58M20 16h-1v-1a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
