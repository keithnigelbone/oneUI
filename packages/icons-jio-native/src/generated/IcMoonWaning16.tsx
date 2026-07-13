import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoonWaning16(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10m8-10c0 4.41-3.59 8-8 8-.85 0-1.67-.14-2.44-.38C7.39 17.79 6 15.07 6 12s1.39-5.78 3.56-7.62C10.33 4.13 11.15 4 12 4c4.41 0 8 3.59 8 8"
          />
    </Svg>
  );
}
