import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFilterMultiple(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 7h9.18a3 3 0 0 0 5.64 0H20a1 1 0 1 0 0-2h-1.18a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2m12-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2m4 12h-1.18a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2h9.18a3 3 0 0 0 5.64 0H20a1 1 0 1 0 0-2m-4 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4-8h-9.18a3 3 0 0 0-5.64 0H4a1 1 0 0 0 0 2h1.18a3 3 0 0 0 5.64 0H20a1 1 0 1 0 0-2M8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
