import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTorch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v3a1 1 0 0 0 1 1m-3.71.82a1 1 0 0 0 .25-1.39L6.82 4a1 1 0 1 0-1.64 1.12L6.9 7.57a1 1 0 0 0 1.39.25m10-4.1A1 1 0 0 0 16.9 4l-1.72 2.43a1 1 0 1 0 1.64 1.14l1.72-2.45a1 1 0 0 0-.25-1.4M16 9H8a2 2 0 0 0-1.85 1.23 2 2 0 0 0 .44 2.18L9 14.83V19a3 3 0 0 0 6 0v-4.17l2.41-2.42a2 2 0 0 0 .44-2.18A2 2 0 0 0 16 9m-4 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
