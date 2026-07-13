import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScale(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 7h-1v5a1 1 0 0 1-2 0V7h-2v3a1 1 0 0 1-2 0V7h-2v5a1 1 0 0 1-2 0V7H7v3a1 1 0 1 1-2 0V7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
