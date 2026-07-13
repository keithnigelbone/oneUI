import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGateway1(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.4 9.22a1 1 0 1 0 1.2 1.6 4 4 0 0 1 4.8 0 1 1 0 0 0 1.2-1.6 6 6 0 0 0-7.2 0M5.78 9a8 8 0 0 1 12.44 0 1 1 0 0 0 .78.37 1 1 0 0 0 .78-1.63 10 10 0 0 0-15.56 0A1.003 1.003 0 1 0 5.78 9m15.34 3.9A3 3 0 0 0 19 12H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a3 3 0 0 0-.88-2.12zM9 17H6a1 1 0 1 1 0-2h3a1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
