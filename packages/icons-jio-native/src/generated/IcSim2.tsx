import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSim2(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.12 2.88A3 3 0 0 0 16 2h-5a3 3 0 0 0-2.38 1.13l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12M14.5 17H10a1 1 0 0 1-.77-1.63l3.26-4a.82.82 0 0 0 .07-1.19.79.79 0 0 0-1.12 0 .6.6 0 0 0-.12.16.8.8 0 0 0-.1.25.7.7 0 0 0 0 .15 1 1 0 0 1-2 0 3 3 0 0 1 0-.51 2.5 2.5 0 0 1 .32-.89 2.7 2.7 0 0 1 .46-.56 2.807 2.807 0 1 1 3.94 4L12.11 15h2.39a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
