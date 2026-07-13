import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcServer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 11h12a4 4 0 1 0 0-8H6a4 4 0 0 0 0 8m0-5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3M18 13H6a4 4 0 1 0 0 8h12a4 4 0 1 0 0-8M6 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
