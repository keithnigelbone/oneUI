import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlantGrowth(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 17c-.479 0-.95.12-1.37.35A4 4 0 0 0 13 15.14V12h1a3.32 3.32 0 0 0 2.44-1C18 9.46 18 6.62 18 6.5a.5.5 0 0 0-.5-.5A5.15 5.15 0 0 0 13 8.11V3a1 1 0 0 0-2 0v1.11A5.15 5.15 0 0 0 6.5 2a.5.5 0 0 0-.5.5c0 .12 0 3 1.56 4.52A3.32 3.32 0 0 0 10 8h1v7.14a4 4 0 0 0-2.63 2.21A2.9 2.9 0 0 0 7 17a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
