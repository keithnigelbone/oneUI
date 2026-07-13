import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLayout(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 18c0 1.66 1.34 3 3 3h8V10H3zM18 3H6C4.34 3 3 4.34 3 6v2h18V6c0-1.66-1.34-3-3-3m-2 18h2c1.66 0 3-1.34 3-3v-8h-5z"
          />
    </Svg>
  );
}
