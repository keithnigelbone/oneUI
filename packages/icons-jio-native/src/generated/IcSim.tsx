import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSim(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 2h-5a3 3 0 0 0-2.38 1.13l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M7 12h3v3H7zm5 8H8a1 1 0 0 1-1-1v-2h5zm5-1a1 1 0 0 1-1 1h-2v-3h3zm0-4h-5v-3h5z"
          />
    </Svg>
  );
}
