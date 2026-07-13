import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSoil(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 4a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 16.5 5a3.84 3.84 0 0 1-1.85-.41A5.66 5.66 0 0 0 12 4a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 7.5 5a3.84 3.84 0 0 1-1.85-.41A5.6 5.6 0 0 0 3 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
