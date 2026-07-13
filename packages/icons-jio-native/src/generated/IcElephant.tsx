import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcElephant(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 3h-4a4 4 0 0 0-4 4c.001.338.048.675.14 1q.087.353.25.68.067.167.16.32a3 3 0 0 0 .29.44c.06.07.11.15.18.22q.274.311.6.57a1 1 0 0 1 .21 1.4 1 1 0 0 1-1.4.2A6 6 0 0 1 7.09 8H6a3 3 0 0 0-3 3v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h4v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7a1 1 0 0 1 2 0v3a2 2 0 0 0 4 0V7a4 4 0 0 0-4-4m-1 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
