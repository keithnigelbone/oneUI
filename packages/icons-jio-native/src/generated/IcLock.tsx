import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLock(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 7h-1V6a4 4 0 1 0-8 0v1H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3m-5 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4m2-9h-4V6a2 2 0 1 1 4 0z"
          />
    </Svg>
  );
}
