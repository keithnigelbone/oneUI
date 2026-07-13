import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCherry(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.73 11a4.4 4.4 0 0 0-1.27.21L12.38 5h1.9a1 1 0 1 0 0-2h-7a1 1 0 0 0 0 2H9.4L7 12.5a4.25 4.25 0 1 0 2 .35l2-6.19 2.76 5.58a4.26 4.26 0 1 0 3-1.23z"
          />
    </Svg>
  );
}
