import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTvCam(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m8-2h-5v1a3 3 0 0 1-3 3 3.1 3.1 0 0 1-1.67-.5A3 3 0 0 1 9 6V5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-5 14H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
