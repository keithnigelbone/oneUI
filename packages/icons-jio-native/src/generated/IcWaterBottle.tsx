import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWaterBottle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 5h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1m7 8a2 2 0 0 0-2-2 2 2 0 0 0 0-4H9a2 2 0 1 0 0 4 2 2 0 1 0 0 4 2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2 2 2 0 0 0 2-2"
          />
    </Svg>
  );
}
