import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHighTemperatureOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 11h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m-9-5a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1m5.66 1.76 1.41-1.42a1 1 0 1 0-1.41-1.41l-1.42 1.41a1.005 1.005 0 0 0 .71 1.714 1 1 0 0 0 .71-.294M6 12a1 1 0 0 0-1-1H3a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1m5.31-4.93 5.62 5.62q.058-.343.07-.69a5 5 0 0 0-5-5 5 5 0 0 0-.69.07m-5 9.17-1.38 1.42a1 1 0 1 0 1.41 1.41l1.42-1.41a1.004 1.004 0 0 0-1.42-1.42zM4.71 3.29a1.004 1.004 0 1 0-1.42 1.42l4.54 4.54a5 5 0 0 0 6.92 6.92l4.54 4.54a1.002 1.002 0 0 0 1.639-.325 1 1 0 0 0-.219-1.095zM12 18a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
