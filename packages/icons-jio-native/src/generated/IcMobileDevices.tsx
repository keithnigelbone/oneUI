import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMobileDevices(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6h1a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6.56a3.9 3.9 0 0 1-.56-2v-9a4 4 0 0 1 4-4m-6 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2m9-11h-3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2m-1.5 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
