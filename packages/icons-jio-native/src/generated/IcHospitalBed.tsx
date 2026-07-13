import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHospitalBed(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 8h9a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-5a3 3 0 0 0-3 3 1 1 0 0 0 1 1M6.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M18 9H6a3 3 0 0 0-3 3 1 1 0 0 0 1 1h.5v5.39a1.5 1.5 0 1 0 2 0V17h11v1.39a1.5 1.5 0 1 0 2 0V13h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3m-.5 6h-11v-2h11z"
          />
    </Svg>
  );
}
