import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPooja(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 15a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2h-1v-4h1a1 1 0 0 0 0-2h-1A6 6 0 1 0 6 9H5a1 1 0 0 0 0 2h1v4zm3-4h8v4H8zm12 8H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
