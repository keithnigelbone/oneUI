import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPlayCircle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.66 11.1-4.24 3.27A1.5 1.5 0 0 1 9 15.18V8.64a1.5 1.5 0 0 1 2.42-1.19l4.24 3.27a1.5 1.5 0 0 1 0 2.38"
          />
    </Svg>
  );
}
