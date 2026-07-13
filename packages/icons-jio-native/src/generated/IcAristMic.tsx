import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAristMic(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10M9.25 9.81l-4.68 6.43a3 3 0 0 0 4.44 4l5.91-5.32a7 7 0 0 1-5.67-5.11M9 16.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
