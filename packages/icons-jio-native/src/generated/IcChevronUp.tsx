import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChevronUp(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 15a1 1 0 0 1-.71-.29L12 11.41l-3.29 3.3a1.004 1.004 0 0 1-1.42-1.42l4-4a1 1 0 0 1 1.42 0l4 4A1.001 1.001 0 0 1 16 15"
          />
    </Svg>
  );
}
