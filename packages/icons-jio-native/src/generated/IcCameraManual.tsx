import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCameraManual(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 7h-.9a1 1 0 0 1-.84-.47l-1-1.6a2 2 0 0 0-1.7-.93H9.44a2 2 0 0 0-1.69.93l-1 1.6A1 1 0 0 1 5.9 7H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3m-2 9a1 1 0 0 1-2 0v-3.76l-2.11 4.21a1 1 0 0 1-1.78 0L9 12.24V16a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1h1a1 1 0 0 1 .89.55L12 13.76l2.11-4.21A1 1 0 0 1 15 9h1a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
