import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDryAir(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 9h7a3 3 0 1 0-2.59-4.5 1 1 0 0 0 1.73 1A1 1 0 1 1 11 7H4a1 1 0 0 0 0 2m14-2a3 3 0 0 0-2.59 1.5 1 1 0 0 0 1.73 1A1 1 0 1 1 18 11H4a1 1 0 1 0 0 2h14a3 3 0 0 0 0-6m-6 8H4a1 1 0 1 0 0 2h8a1 1 0 1 1-.86 1.5 1 1 0 0 0-1.73 1A3 3 0 1 0 12 15"
          />
    </Svg>
  );
}
