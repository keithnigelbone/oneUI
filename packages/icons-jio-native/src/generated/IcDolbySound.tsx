import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDolbySound(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3M7 16a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1 4 4 0 0 1 0 8m11-1a1 1 0 0 1-1 1 4 4 0 1 1 0-8 1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
