import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHumidity(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m17.7 10.4-4.85-7.92a1 1 0 0 0-1.7 0L6.3 10.4A8.8 8.8 0 0 0 5 15a7 7 0 0 0 14 0 8.8 8.8 0 0 0-1.3-4.6M9.25 10a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5m5.5 8a1.25 1.25 0 1 1 0-2.501 1.25 1.25 0 0 1 0 2.501m1-6.29-6 6a1 1 0 0 1-1.42 0 1 1 0 0 1 0-1.42l6-6a1.004 1.004 0 1 1 1.42 1.42"
          />
    </Svg>
  );
}
