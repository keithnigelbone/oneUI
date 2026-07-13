import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDining(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 16h18a1 1 0 0 0 1-1 10 10 0 0 0-9-9.95 1 1 0 0 0-2 0A10 10 0 0 0 2 15a1 1 0 0 0 1 1m18 2H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
