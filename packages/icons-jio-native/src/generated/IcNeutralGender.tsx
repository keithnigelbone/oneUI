import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNeutralGender(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 2h-3a1 1 0 1 0 0 2h.59l-1.84 1.83A5 5 0 1 0 11 14.9V17H9a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 0-2h-2v-2.1a5 5 0 0 0 3.17-7.65L18 5.41V6a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1m-7 11a3 3 0 1 1 0-5.999A3 3 0 0 1 12 13"
          />
    </Svg>
  );
}
