import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBathtub(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 10h-3a1 1 0 0 0-1-1V7a3 3 0 0 0-6 0 1 1 0 0 0 2 0 1 1 0 0 1 2 0v2a1 1 0 0 0-1 1H3a1 1 0 0 0 0 2h1v2a4 4 0 0 0 3 3.86V19a1 1 0 1 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1.14A4 4 0 0 0 20 14v-2h1a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
