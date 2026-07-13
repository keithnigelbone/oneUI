import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLaptopScreen(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 17h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2m16 1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
