import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoonWaning26Cresent(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10m8-10c0 4.4-3.57 7.98-7.97 8C9.59 18.18 8 15.28 8 12s1.59-6.18 4.03-8c4.4.02 7.97 3.6 7.97 8"
          />
    </Svg>
  );
}
