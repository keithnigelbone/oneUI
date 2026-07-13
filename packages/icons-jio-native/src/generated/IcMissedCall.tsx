import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMissedCall(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 12c.55 0 1-.45 1-1V8.91l5.29 5.29c.2.2.45.29.71.29s.51-.1.71-.29l5-5a.996.996 0 1 0-1.41-1.41l-4.29 4.29-4.59-4.59h2.09c.55 0 1-.45 1-1s-.45-1-1-1h-4.5c-.55 0-1 .45-1 1v4.5c0 .55.45 1 1 1zM18 16.54H6a.96.96 0 0 0 0 1.92h12a.96.96 0 0 0 0-1.92"
          />
    </Svg>
  );
}
