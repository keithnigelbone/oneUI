import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArrowDown(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.71 14.29a1 1 0 0 0-1.42 0L13 18.59V3a1 1 0 1 0-2 0v15.59l-4.29-4.3a1.004 1.004 0 1 0-1.42 1.42l6 6a1 1 0 0 0 1.42 0l6-6a1 1 0 0 0 0-1.42"
          />
    </Svg>
  );
}
