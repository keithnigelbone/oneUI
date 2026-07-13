import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcReplay(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 15c.196-.002.387-.06.55-.17l3-2a1 1 0 0 0 0-1.66l-3-2a1 1 0 0 0-1-.05A1 1 0 0 0 10 10v4a1 1 0 0 0 .53.88c.145.078.306.12.47.12m1-13A10 10 0 0 0 2 12a8 8 0 0 0 .07 1.12 1.007 1.007 0 1 0 2-.24A9 9 0 0 1 4 12a8 8 0 1 1 2.73 6h.77a1 1 0 0 0 0-2h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0v-.43A10 10 0 1 0 12 2"
          />
    </Svg>
  );
}
