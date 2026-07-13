import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWater(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m17.7 10.4-4.85-7.92a1 1 0 0 0-1.7 0L6.3 10.4A8.8 8.8 0 0 0 5 15a7 7 0 0 0 14 0 8.8 8.8 0 0 0-1.3-4.6"
          />
    </Svg>
  );
}
