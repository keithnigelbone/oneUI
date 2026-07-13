import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAstrology(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-1.4 9.29a1 1 0 0 1-1.2-1.6A1.5 1.5 0 1 0 13 9.5V17a1 1 0 0 1-2 0V9.5a1.5 1.5 0 1 0-2.4 1.19 1 1 0 1 1-1.2 1.6A3.49 3.49 0 1 1 12 7.06a3.49 3.49 0 1 1 4.6 5.23"
          />
    </Svg>
  );
}
