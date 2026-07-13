import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCameraVarifocalDome(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-2 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-4-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2M8 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-2 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a3 3 0 1 1 0-5.999A3 3 0 0 1 12 15m4 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-6-2a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
