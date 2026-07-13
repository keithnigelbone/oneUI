import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArea(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-1.29.3l16 16c.193-.406.292-.85.29-1.3V6a3 3 0 0 0-3-3M3 6v12a3 3 0 0 0 3 3h12a3 3 0 0 0 1.29-.3l-16-16A3 3 0 0 0 3 6"
          />
    </Svg>
  );
}
