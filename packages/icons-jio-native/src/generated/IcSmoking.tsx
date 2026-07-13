import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmoking(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 10H6v6h13a3 3 0 0 0 0-6M2 16h2v-6H2zm9-12a1 1 0 0 0-2 0 1 1 0 0 1-1 1H5a3 3 0 0 0-3 3 1 1 0 0 0 2 0 1 1 0 0 1 1-1h3a3 3 0 0 0 3-3"
          />
    </Svg>
  );
}
