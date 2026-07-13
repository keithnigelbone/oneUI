import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFlightMode(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.5 3.5a2 2 0 0 0-2.83 0L14.13 7 4.7 5.81a1.5 1.5 0 0 0-1 2.76L9.18 12l-1.41 1.4-3 .27a1.5 1.5 0 0 0-.6 2.8l2.14 1.21 1.21 2.14a1.5 1.5 0 0 0 2.8-.6l.27-3 1.41-1.4 3.42 5.47a1.5 1.5 0 0 0 2.76-1L17 9.87l3.5-3.54a2 2 0 0 0 0-2.83"
          />
    </Svg>
  );
}
