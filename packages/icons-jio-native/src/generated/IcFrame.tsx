import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFrame(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 16h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2m11 2h-1V6h1a1 1 0 1 0 0-2h-1V3a1 1 0 0 0-2 0v1H6V3a1 1 0 0 0-2 0v1H3a1 1 0 0 0 0 2h1v12H3a1 1 0 0 0 0 2h1v1a1 1 0 1 0 2 0v-1h12v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2m-3 0H6V6h12z"
          />
    </Svg>
  );
}
