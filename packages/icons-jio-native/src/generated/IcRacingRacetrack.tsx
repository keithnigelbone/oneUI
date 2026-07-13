import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRacingRacetrack(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 19h-3v-4h3.19a.5.5 0 0 0 .45-.72L20 13l.64-1.28a.5.5 0 0 0-.45-.72H15v8h-3a7 7 0 0 1 0-14h8a1 1 0 1 0 0-2h-8a9 9 0 1 0 0 18h8a1 1 0 0 0 0-2m0-12h-8a5 5 0 1 0 0 10h1v-2h-1a3 3 0 0 1 0-6h8a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
