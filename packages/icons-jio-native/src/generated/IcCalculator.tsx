import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCalculator(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M8 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2M8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
