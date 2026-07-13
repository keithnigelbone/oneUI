import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLockUnlock(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 7h-7v-.93a2 2 0 0 1 1.5-2 2 2 0 0 1 2 .63 1 1 0 0 0 .72.31A1 1 0 0 0 15 3.32 4 4 0 0 0 11.41 2 4.13 4.13 0 0 0 8 6.17V7H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3m-5 9a2 2 0 1 1 0-3.999 2 2 0 0 1 0 4"
          />
    </Svg>
  );
}
