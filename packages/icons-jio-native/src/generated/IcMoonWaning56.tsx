import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoonWaning56(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10m8-10c0 3.56-2.34 6.58-5.56 7.62C16.61 17.79 18 15.07 18 12s-1.39-5.78-3.56-7.62C17.66 5.42 20 8.44 20 12"
          />
    </Svg>
  );
}
