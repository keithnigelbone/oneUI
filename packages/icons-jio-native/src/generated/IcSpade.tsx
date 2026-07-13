import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSpade(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 11h-3V9h.13a1 1 0 0 0 1-.86L14.58 5a2.61 2.61 0 1 0-5.16 0l.46 3.17a1 1 0 0 0 1 .86H11v2H8a2 2 0 0 0-2 2v4.38a3 3 0 0 0 1.66 2.69l3.45 1.72a2 2 0 0 0 1.78 0l3.45-1.72A3 3 0 0 0 18 17.38V13a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
