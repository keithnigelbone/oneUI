import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallMissed(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.6 16.4c-.87-1.12-3.31-3.4-8.6-3.4s-7.72 2.28-8.6 3.4c-.27.34-.4.77-.4 1.2V19c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-1s0-1 1-1h6s1 0 1 1v1c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-1.4c0-.44-.13-.86-.4-1.2M7 8c.55 0 1-.45 1-1v-.59l4.29 4.29c.2.2.45.29.71.29s.51-.1.71-.29l4-4a.996.996 0 1 0-1.41-1.41l-3.29 3.29-3.59-3.59h.59c.55 0 1-.45 1-1s-.45-1-1-1h-3c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1z"
          />
    </Svg>
  );
}
