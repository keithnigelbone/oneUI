import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCooking(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 20H7a1 1 0 1 0 0 2h10a1 1 0 0 0 0-2m0-15h-.4a5 5 0 0 0-9.2 0H7a5 5 0 0 0-1 9.9V17a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2.1A5 5 0 0 0 17 5"
          />
    </Svg>
  );
}
