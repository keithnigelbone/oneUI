import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoreHorizontal(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5.5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m6.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m6.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
