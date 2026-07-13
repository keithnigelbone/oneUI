import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStudent(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m14.47 12.39-1.9 1.41a1 1 0 0 1-1.2 0l-1.88-1.39A8 8 0 0 0 4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-5.53-7.61M5 8a1 1 0 0 0 1-1V4h1.5v2.5a4.5 4.5 0 0 0 9 0V4H19a1 1 0 1 0 0-2H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1"
          />
    </Svg>
  );
}
