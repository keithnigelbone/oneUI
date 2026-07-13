import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIncoming(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.29 4.29 6 16.59V9a1 1 0 0 0-2 0v10a1 1 0 0 0 .08.38 1 1 0 0 0 .54.54c.12.051.25.079.38.08h10a1 1 0 0 0 0-2H7.41l12.3-12.29a1.004 1.004 0 0 0-1.42-1.42"
          />
    </Svg>
  );
}
