import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBusFront(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 2H8a4 4 0 0 0-4 4v13a1 1 0 0 0 1 1v1a1 1 0 1 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1a1 1 0 0 0 1-1V6a4 4 0 0 0-4-4M7 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
