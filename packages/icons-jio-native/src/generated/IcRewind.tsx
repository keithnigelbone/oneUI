import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRewind(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m6.41 12 6.3-6.29a1 1 0 0 0-.325-1.639 1 1 0 0 0-1.095.219l-7 7a1 1 0 0 0 0 1.42l7 7a1.004 1.004 0 1 0 1.42-1.42zm5 0 6.3-6.29a1 1 0 0 0-.325-1.639 1 1 0 0 0-1.095.219l-7 7a1 1 0 0 0 0 1.42l7 7a1.004 1.004 0 1 0 1.42-1.42z"
          />
    </Svg>
  );
}
