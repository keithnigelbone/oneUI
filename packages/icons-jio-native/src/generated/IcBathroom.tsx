import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBathroom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 10H8v4h4zm9 0h-3V7a3 3 0 0 0-6 0 1 1 0 0 0 2 0 1 1 0 0 1 2 0v3h-2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4H3a1 1 0 0 0 0 2h.15l.45 2.66A4 4 0 0 0 7 18v1a1 1 0 1 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1a4 4 0 0 0 3.4-3.29l.45-2.71H21a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
