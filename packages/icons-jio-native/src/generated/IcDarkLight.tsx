import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDarkLight(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 18A8 8 0 0 1 9.69 4.35a10 10 0 0 0 7.74 13.53A8 8 0 0 1 12 20"
          />
    </Svg>
  );
}
