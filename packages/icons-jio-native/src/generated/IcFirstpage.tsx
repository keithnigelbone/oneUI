import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFirstpage(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1m5.41 8 6.29-6.29a.996.996 0 1 0-1.41-1.41l-7 7a.996.996 0 0 0 0 1.41l7 7c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-6.29-6.29z"
          />
    </Svg>
  );
}
