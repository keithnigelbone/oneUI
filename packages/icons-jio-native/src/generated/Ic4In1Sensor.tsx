import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function Ic4In1Sensor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 10H9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3m-1.5 7H13v.5a.5.5 0 0 1-1 0V17h-1.5a.52.52 0 0 1-.41-.21.48.48 0 0 1-.06-.45l1-3a.5.5 0 1 1 .94.32L11.19 16H12v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 1 1 0 1m5.17-12.44a10 10 0 0 0-13.34 0 1.002 1.002 0 0 0 1.34 1.49 8 8 0 0 1 10.66 0 1 1 0 0 0 .67.25 1 1 0 0 0 .74-.3 1 1 0 0 0-.07-1.44M9.61 8.82a4 4 0 0 1 4.78 0 1.002 1.002 0 1 0 1.22-1.59 6 6 0 0 0-7.22 0 1.002 1.002 0 1 0 1.22 1.59"
          />
    </Svg>
  );
}
