import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUser(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0 14a8 8 0 0 1-6.54-3.41C6.46 15.08 9 14 12 14s5.54 1.08 6.54 2.59A8 8 0 0 1 12 20"
          />
    </Svg>
  );
}
