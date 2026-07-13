import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMedicineMortar(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.63 6.16a2 2 0 0 0-3.26-2.32L14.4 8h4.92zM20 10H4a1 1 0 0 0-1 1 9 9 0 0 0 5 8.05V20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-.95a9 9 0 0 0 5-8A1 1 0 0 0 20 10m-6 6h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
