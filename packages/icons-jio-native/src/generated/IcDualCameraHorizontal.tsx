import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDualCameraHorizontal(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2m8-5H8a6 6 0 1 0 0 12h8a6 6 0 1 0 0-12m-8 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6m8 0a3 3 0 1 1 0-5.999A3 3 0 0 1 16 15m0-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
