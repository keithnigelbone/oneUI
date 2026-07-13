import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOverlappingLayout(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 9.99c0-2.21 1.79-4 4-4h2v-1c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h2z"
          />
          <Path
            fill={fill}
            d="M18 7.99h-6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
