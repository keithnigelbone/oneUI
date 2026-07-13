import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoonFull(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10"
          />
    </Svg>
  );
}
