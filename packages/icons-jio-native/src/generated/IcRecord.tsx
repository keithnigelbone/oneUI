import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRecord(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18a8 8 0 1 1 0-16.001A8 8 0 0 1 12 20m0-13a5 5 0 1 0 0 10 5 5 0 0 0 0-10"
          />
    </Svg>
  );
}
