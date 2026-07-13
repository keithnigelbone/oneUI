import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlignHorizontalCenters(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 7h-4V3c0-.55-.45-1-1-1s-1 .45-1 1v4H7c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3h4v4c0 .55.45 1 1 1s1-.45 1-1v-4h4c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3"
          />
    </Svg>
  );
}
