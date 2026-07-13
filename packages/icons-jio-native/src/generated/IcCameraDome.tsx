import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCameraDome(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2M5 19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-2H5zM16 2H8a3 3 0 0 0-3 3v9h14V5a3 3 0 0 0-3-3m-4 9a3 3 0 1 1 0-5.999A3 3 0 0 1 12 11"
          />
    </Svg>
  );
}
