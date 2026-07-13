import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLine(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.71 19.29-16-16A.996.996 0 1 0 3.3 4.7l15.99 16.01c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41z"
          />
    </Svg>
  );
}
