import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNas(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3M6 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m5 11H9.5a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5H11zm4 0h-2V5h2zm4-.5a.5.5 0 0 1-.5.5H17V5h1.5a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
