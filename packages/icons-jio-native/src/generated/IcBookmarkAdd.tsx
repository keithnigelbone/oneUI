import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBookmarkAdd(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 3 1.73l5-2.88 5 2.88a2 2 0 0 0 1 .27 2 2 0 0 0 1.732-1.001A2 2 0 0 0 20 20V4a2 2 0 0 0-2-2m-4 9h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1V8a1 1 0 0 1 2 0v1h1a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
