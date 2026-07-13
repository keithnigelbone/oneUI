import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifiConnected(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.45 10.94a2 2 0 0 0 .15-2.58A12.38 12.38 0 0 0 12 4a12.27 12.27 0 0 0-9.6 4.37 2 2 0 0 0 .15 2.57l8 8.44A2 2 0 0 0 12 20a2 2 0 0 0 1.45-.62l.12-.13A4.9 4.9 0 0 1 13 17a5 5 0 0 1 5-5c.69.005 1.372.155 2 .44zM17 14a1 1 0 0 0-1 1v2a1 1 0 0 0-.71 1.71l1 1A1 1 0 0 0 17 20a.84.84 0 0 0 .38-.08A1 1 0 0 0 18 19v-4a1 1 0 0 0-1-1m4.71 1.29-1-1a1 1 0 0 0-1.09-.21A1 1 0 0 0 19 15v4a1 1 0 1 0 2 0v-2a.998.998 0 0 0 .71-1.71"
          />
    </Svg>
  );
}
