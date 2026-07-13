import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMessagePartiallyDelivered(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.71 6.29a1 1 0 0 0-1.42 0L8 16.59l-4.29-4.3a1.004 1.004 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l11-11a1 1 0 0 0 0-1.42M20.5 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
