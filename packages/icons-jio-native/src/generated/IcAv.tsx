import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAv(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 9c-1.6 0-3 1.4-3 3s1.4 3 3 3 3-1.4 3-3-1.4-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1m7-4c-1.6 0-3 1.4-3 3s1.4 3 3 3 3-1.4 3-3-1.4-3-3-3m0 4c-.5 0-1-.4-1-1s.5-1 1-1 1 .4 1 1-.5 1-1 1M5 9c-1.7 0-3 1.4-3 3s1.3 3 3 3 3-1.4 3-3-1.3-3-3-3m0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1"
          />
    </Svg>
  );
}
