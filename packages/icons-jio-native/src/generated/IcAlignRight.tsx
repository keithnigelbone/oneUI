import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlignRight(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 3c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1m-6 4H6c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3"
          />
    </Svg>
  );
}
