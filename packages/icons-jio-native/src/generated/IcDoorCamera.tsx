import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDoorCamera(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3H5zm7-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m4-16H8a3 3 0 0 0-3 3v9h14V5a3 3 0 0 0-3-3m-4 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8m0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
          />
    </Svg>
  );
}
