import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOrder(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.7 5.75-7-2.62a2 2 0 0 0-1.4 0l-7 2.62a2 2 0 0 0-.23.13L12 8.93l7.93-3a2 2 0 0 0-.23-.18M3 7.62v8.76a2 2 0 0 0 1.3 1.87l6.7 2.51V10.69L3 7.61zm18 0-8 3.08v10.06l6.7-2.51a2 2 0 0 0 1.3-1.87z"
          />
    </Svg>
  );
}
