import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArrowLineDiagonal(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 15c-.55 0-1 .45-1 1v1.59L6.41 5H8c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V6.41L17.59 19H16c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1"
          />
    </Svg>
  );
}
