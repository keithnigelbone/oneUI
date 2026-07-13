import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScreenReduce(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 13h-2a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3m0-10H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h6a4.92 4.92 0 0 1-1-3v-2a5 5 0 0 1 5-5h2a4.92 4.92 0 0 1 3 1V6a3 3 0 0 0-3-3m-7 7c-.002.13-.029.26-.08.38a1 1 0 0 1-.54.54c-.12.051-.25.078-.38.08H7a1 1 0 0 1 0-2h.59l-2.3-2.29a1.004 1.004 0 0 1 1.42-1.42L9 7.59V7a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
