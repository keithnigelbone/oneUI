import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCameraHighEnd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 7h-.9a1 1 0 0 1-.84-.47l-1-1.6a2 2 0 0 0-1.7-.93H9.44a2 2 0 0 0-1.69.93l-1 1.6A1 1 0 0 1 5.9 7H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3m-7 9a3 3 0 1 1 0-5.999A3 3 0 0 1 12 16m6-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
