import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmokingOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 10h-3.56l5-5A1.036 1.036 0 0 0 19 3.51L3.51 19A1.054 1.054 0 1 0 5 20.49L9.44 16H19a3 3 0 0 0 0-6M3 9a1 1 0 0 0 1-1 1 1 0 0 1 1-1h3a3 3 0 0 0 3-3 1 1 0 0 0-2 0 1 1 0 0 1-1 1H5a3 3 0 0 0-3 3 1 1 0 0 0 1 1m3 4.76L9.76 10H6zM4 10H2v6h2z"
          />
    </Svg>
  );
}
