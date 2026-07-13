import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLuggage(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M2 10v8a3 3 0 0 0 3 3V7a3 3 0 0 0-3 3m17-3v14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-5-4h-4a3 3 0 0 0-3 3v15h10V6a3 3 0 0 0-3-3m1 4H9V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
