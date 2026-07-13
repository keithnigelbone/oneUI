import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSecurityCameraCeiling(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.41 3.59A2 2 0 0 0 19 3H5a2 2 0 0 0 0 4h14a2 2 0 0 0 1.41-3.41M18 9H6a1 1 0 0 0-1 1v4a7 7 0 1 0 14 0v-4a1 1 0 0 0-1-1m-3.88 8.12A3 3 0 0 1 12 18a3 3 0 0 1-.584-5.941A3 3 0 0 1 15 15a3 3 0 0 1-.88 2.12M12 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
