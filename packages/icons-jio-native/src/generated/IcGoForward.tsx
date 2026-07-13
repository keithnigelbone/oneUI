import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGoForward(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 12a1 1 0 0 0-1 1 6 6 0 1 1-6.44-6l-.27.27a1 1 0 0 0 .325 1.64 1 1 0 0 0 1.095-.22l2-2a1 1 0 0 0 0-1.42l-2-2a1.003 1.003 0 1 0-1.42 1.42l.32.31A8 8 0 1 0 20 13a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
