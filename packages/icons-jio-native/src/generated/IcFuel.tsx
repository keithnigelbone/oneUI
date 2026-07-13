import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFuel(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.12 7.71-2.41-2.42a1.003 1.003 0 1 0-1.42 1.42l1.49 1.48A1.5 1.5 0 0 0 18.5 11q.257-.006.5-.09V18a1 1 0 0 1-2 0v-2a3 3 0 0 0-3-3h-1V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-5h1a1 1 0 0 1 1 1v2a3 3 0 0 0 6 0V9.83a3 3 0 0 0-.88-2.12M11 9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
