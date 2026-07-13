import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBedMedical(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 8h1v1a1 1 0 0 0 2 0V8h1a1 1 0 1 0 0-2h-1V5a1 1 0 0 0-2 0v1h-1a1 1 0 1 0 0 2m2 4H8v-1a3 3 0 0 0-3-3H4V5a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-4a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
