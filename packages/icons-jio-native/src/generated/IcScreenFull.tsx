import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScreenFull(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m0 7a1 1 0 0 1-2 0v-.59L9.41 16H10a1 1 0 0 1 0 2H7a1 1 0 0 1-.38-.08 1 1 0 0 1-.54-.54A1 1 0 0 1 6 17v-3a1 1 0 1 1 2 0v.59L14.59 8H14a1 1 0 1 1 0-2h3a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54c.051.12.078.25.08.38z"
          />
    </Svg>
  );
}
