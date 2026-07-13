import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCameraAuto(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11.12 14h1.76L12 12.24zM19 7h-.9a1 1 0 0 1-.84-.47l-1-1.6a2 2 0 0 0-1.7-.93H9.44a2 2 0 0 0-1.69.93l-1 1.6A1 1 0 0 1 5.9 7H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3m-3.55 9.89A.9.9 0 0 1 15 17a1 1 0 0 1-.89-.55l-.23-.45h-3.76l-.23.45a1 1 0 0 1-1.78-.9l3-6a1 1 0 0 1 1.78 0l3 6a1 1 0 0 1-.44 1.34"
          />
    </Svg>
  );
}
