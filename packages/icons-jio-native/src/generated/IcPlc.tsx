import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlc(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3h-6a3 3 0 0 0-3 3H7a1 1 0 0 0-1 1v1H4a1 1 0 0 0 0 2h2v2H4a1 1 0 0 0 0 2h2v1a1 1 0 0 0 1 1h2v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
