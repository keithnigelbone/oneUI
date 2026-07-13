import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartFridge(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-7H5zm2-4a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0zm9-13H8a3 3 0 0 0-3 3v5h14V5a3 3 0 0 0-3-3M9 7a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
