import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcComparison(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 5H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1m4-3a1 1 0 0 0-1 1v18a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1m7 3h-3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
