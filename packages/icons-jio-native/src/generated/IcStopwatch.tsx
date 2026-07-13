import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStopwatch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 4h4a1 1 0 1 0 0-2h-4a1 1 0 0 0 0 2m8.71 2.71a1 1 0 1 0 1.41-1.42l-1.41-1.41a1 1 0 1 0-1.42 1.41zM12 5a8.5 8.5 0 1 0 8.5 8.5A8.51 8.51 0 0 0 12 5m1 8a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
