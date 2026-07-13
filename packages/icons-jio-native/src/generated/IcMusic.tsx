import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMusic(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.19 2.4a2 2 0 0 0-1.76-.31l-8 2.4A2 2 0 0 0 9 6.4v8.15A4 4 0 1 0 11 18V6.4L19 4v8.55A4 4 0 1 0 21 16V4a2 2 0 0 0-.81-1.6"
          />
    </Svg>
  );
}
