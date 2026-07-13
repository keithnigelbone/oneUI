import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDice2(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h1v-5a5 5 0 0 1 5-5zm3 2h-8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-6.5 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
