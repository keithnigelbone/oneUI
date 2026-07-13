import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPairing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 12a1 1 0 0 0 1 1h6a1 1 0 0 0 0-2H9a1 1 0 0 0-1 1m2 4H8a4 4 0 1 1 0-8h2a1 1 0 1 0 0-2H8a6 6 0 1 0 0 12h2a1 1 0 0 0 0-2m6-10h-2a1 1 0 1 0 0 2h2a4 4 0 1 1 0 8h-2a1 1 0 0 0 0 2h2a6 6 0 1 0 0-12"
          />
    </Svg>
  );
}
