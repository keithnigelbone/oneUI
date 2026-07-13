import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStop(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.84 4H7.16A3.16 3.16 0 0 0 4 7.16v9.68A3.16 3.16 0 0 0 7.16 20h9.68A3.16 3.16 0 0 0 20 16.84V7.16A3.16 3.16 0 0 0 16.84 4"
          />
    </Svg>
  );
}
