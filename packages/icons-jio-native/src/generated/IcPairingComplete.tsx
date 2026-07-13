import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPairingComplete(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6H8a6 6 0 1 0 0 12h8a6 6 0 1 0 0-12m0 7H8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
