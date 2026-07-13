import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcReplyAll(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 9V7a2 2 0 0 0-1.23-1.85 2 2 0 0 0-2.18.44l-5 5a2 2 0 0 0 0 2.82l5 5a2 2 0 0 0 2.18.44A2 2 0 0 0 11 17v-2c6.33 0 8.32 4.39 8.85 6.22a1.08 1.08 0 0 0 1 .78A1.09 1.09 0 0 0 22 20.84C21.25 10.86 11 9 11 9m2-2v.44a16.37 16.37 0 0 1 9 6.81v-.14c-.57-7.63-8.41-9-8.41-9V3.53A1.53 1.53 0 0 0 11 2.45l-.76.76c.1 0 .21 0 .31.09A4 4 0 0 1 13 7"
          />
    </Svg>
  );
}
