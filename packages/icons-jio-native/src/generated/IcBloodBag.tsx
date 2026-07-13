import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBloodBag(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 16c-1.65 0-3 1.35-3 3 0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1v-1c1.1 0 2-.9 2-2v-.28l1.63-.54a2 2 0 0 0 1.37-1.9V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9.28c0 .86.55 1.62 1.37 1.9l1.63.54V16c0 1.1.9 2 2 2v1c0 1.65 1.35 3 3 3h1c1.65 0 3-1.35 3-3 0-.55.45-1 1-1s1 .45 1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-1.65-1.35-3-3-3m-7-4c-.55 0-1-.45-1-1v-1H8c-.55 0-1-.45-1-1s.45-1 1-1h1V7c0-.55.45-1 1-1s1 .45 1 1v1h1c.55 0 1 .45 1 1s-.45 1-1 1h-1v1c0 .55-.45 1-1 1"
          />
    </Svg>
  );
}
