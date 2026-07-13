import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKitchenPot(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 6h-2a3 3 0 0 0-6 0H7a3 3 0 0 0-3 3h16a3 3 0 0 0-3-3m-6 0a1 1 0 0 1 2 0zm9 5H4a1 1 0 0 0 0 2v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
