import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJioFiDongle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13 2h-2a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4m1 7a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
