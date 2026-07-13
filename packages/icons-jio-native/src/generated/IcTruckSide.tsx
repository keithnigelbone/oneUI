import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTruckSide(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M2 6v10a2 2 0 0 0 2 2h.18a3 3 0 0 0 5.64 0h4.36a3 3 0 0 0 5.64 0H20a2 2 0 0 0 2-2v-3.53a3.3 3.3 0 0 0-.32-1.34l-1.24-2.47A3 3 0 0 0 17.76 7H16V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2m14 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0m0-8h1.76a1 1 0 0 1 .89.55L19.88 12H16zM6 17a1 1 0 1 1 2 0 1 1 0 0 1-2 0"
          />
    </Svg>
  );
}
