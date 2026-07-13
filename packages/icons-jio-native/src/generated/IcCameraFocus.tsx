import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCameraFocus(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m9 3h-1.07A8 8 0 0 0 13 4.07V3a1 1 0 0 0-2 0v1.07A8 8 0 0 0 4.07 11H3a1 1 0 0 0 0 2h1.07A8 8 0 0 0 11 19.93V21a1 1 0 0 0 2 0v-1.07A8 8 0 0 0 19.93 13H21a1 1 0 0 0 0-2m-9 7a6 6 0 1 1 0-12 6 6 0 0 1 0 12"
          />
    </Svg>
  );
}
