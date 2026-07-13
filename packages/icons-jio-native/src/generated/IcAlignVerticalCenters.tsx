import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlignVerticalCenters(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 11h-4V7c0-1.66-1.34-3-3-3h-4C8.34 4 7 5.34 7 7v4H3c-.55 0-1 .45-1 1s.45 1 1 1h4v4c0 1.66 1.34 3 3 3h4c1.66 0 3-1.34 3-3v-4h4c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </Svg>
  );
}
