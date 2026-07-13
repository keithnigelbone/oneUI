import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifiSignInRequired(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 14a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1m0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m3.6-10.64A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44a2 2 0 0 0 2.239.459c.249-.107.474-.263.661-.46l.12-.13A4.9 4.9 0 0 1 13 17a5 5 0 0 1 5-5 4.9 4.9 0 0 1 2 .44l1.42-1.5a2 2 0 0 0 .18-2.58"
          />
    </Svg>
  );
}
