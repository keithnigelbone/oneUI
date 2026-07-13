import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJioLink(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-6 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3.38-3.77a1 1 0 0 1-1.37.35 3.79 3.79 0 0 0-4 0 1 1 0 0 1-1-1.72 5.83 5.83 0 0 1 6.08 0 1 1 0 0 1 .29 1.37m2.45-3.15a1 1 0 0 1-1.39.27 8.09 8.09 0 0 0-8.88 0 1.002 1.002 0 0 1-1.12-1.66 10.15 10.15 0 0 1 11.12 0 1 1 0 0 1 .27 1.39"
          />
    </Svg>
  );
}
