import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFanSpeedLow(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-3 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m4-2c0-1-.84-3-4-3s-4 2-4 3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1m6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-3 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m6-4h-6a1 1 0 0 0-1 1c0 1 .84 3 4 3s4-2 4-3a1 1 0 0 0-1-1m-4-5c0-3.16-2-4-3-4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1c1 0 3-.84 3-4m-5 6c-1 0-3 .84-3 4s2 4 3 4a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
