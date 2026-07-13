import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIron(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 10H6V9a1 1 0 0 1 1-1h6a2 2 0 0 0 0-4H7a5 5 0 0 0-5 5v6a1 1 0 0 0 1 1h19a6 6 0 0 0-6-6M4 19a1 1 0 0 0 1 1h17v-2H4z"
          />
    </Svg>
  );
}
