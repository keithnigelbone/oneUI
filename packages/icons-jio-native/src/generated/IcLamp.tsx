import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLamp(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.94 11.51-2-8A2 2 0 0 0 16 2H8a2 2 0 0 0-1.94 1.51l-2 8A2 2 0 0 0 6 14h5v6H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-6h5a2 2 0 0 0 1.94-2.49"
          />
    </Svg>
  );
}
