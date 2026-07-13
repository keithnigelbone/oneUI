import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCinchCable(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 20h-1a1 1 0 0 1-1-1v-1a3 3 0 0 0-6 0v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-.14A4 4 0 0 0 11 15H3a4 4 0 0 0 3 3.86V19a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1a1 1 0 0 1 2 0v1a3 3 0 0 0 3 3h1a1 1 0 0 0 0-2m-9-10a2 2 0 0 0-1-1.72V7.5a1.51 1.51 0 0 0-1-1.41V5a1 1 0 0 0-1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0-1 1v1.09A1.51 1.51 0 0 0 4 7.5v.78A2 2 0 0 0 3 10v3h8z"
          />
    </Svg>
  );
}
