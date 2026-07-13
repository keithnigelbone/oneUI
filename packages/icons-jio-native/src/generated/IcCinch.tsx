import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCinch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 18.86V21a1 1 0 0 0 2 0v-2.14A4 4 0 0 0 16 15H8a4 4 0 0 0 3 3.86m4-10.58V7.5a1.51 1.51 0 0 0-1-1.41V5a1 1 0 0 0-1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0-1 1v1.09A1.51 1.51 0 0 0 9 7.5v.78A2 2 0 0 0 8 10v3h8v-3a2 2 0 0 0-1-1.72"
          />
    </Svg>
  );
}
