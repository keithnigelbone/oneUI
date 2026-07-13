import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSpdifOpticalPos(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 13a3 3 0 1 1 0-5.999A3 3 0 0 1 12 15"
          />
    </Svg>
  );
}
