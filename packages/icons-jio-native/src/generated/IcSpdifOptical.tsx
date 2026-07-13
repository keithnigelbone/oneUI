import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSpdifOptical(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6m0-7a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18a8 8 0 1 1 0-16.001A8 8 0 0 1 12 20"
          />
    </Svg>
  );
}
