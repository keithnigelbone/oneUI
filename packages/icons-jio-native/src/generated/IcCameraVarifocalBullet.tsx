import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCameraVarifocalBullet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11.978 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9.71-3-3-5a2 2 0 0 0-1.71-1h-10a2 2 0 0 0-1.71 1l-3 5a2 2 0 0 0 1.71 3h1v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4h1a2 2 0 0 0 1.74-1 2 2 0 0 0-.03-2m-9.71 7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
          />
    </Svg>
  );
}
