import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStoreRoom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 8h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1m7 8h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1m-7 0h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1M20 3a1 1 0 0 0-1 1v5H5V4a1 1 0 0 0-2 0v16a1 1 0 1 0 2 0v-1h14v1a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1m-1 14H5v-6h14z"
          />
    </Svg>
  );
}
