import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVisible(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.69 10.74A10.87 10.87 0 0 0 12 5a10.87 10.87 0 0 0-9.69 5.74 2.74 2.74 0 0 0 0 2.52A10.87 10.87 0 0 0 12 19a10.87 10.87 0 0 0 9.69-5.74 2.74 2.74 0 0 0 0-2.52m-9.1 4.2a3 3 0 1 1-1.183-5.881 3 3 0 0 1 1.183 5.881"
          />
    </Svg>
  );
}
