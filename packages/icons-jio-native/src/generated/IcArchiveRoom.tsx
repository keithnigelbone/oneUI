import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArchiveRoom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7H5zm5-4h4a1 1 0 0 1 0 2h-4a1 1 0 0 1 0-2M20 2H4a1 1 0 0 0 0 2h1v7h14V4h1a1 1 0 1 0 0-2m-6 6h-4a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
