import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWork(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 7h-2V6a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3M9 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9z"
          />
    </Svg>
  );
}
