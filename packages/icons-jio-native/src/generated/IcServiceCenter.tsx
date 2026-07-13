import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcServiceCenter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 10h-3V9h-2v1h-4a3 3 0 0 0-6 0H4a1 1 0 0 0 0 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a1 1 0 0 0 0-2m-7-2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1M8 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
          />
    </Svg>
  );
}
