import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDth(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 3a2 2 0 0 0-2 2q.004.26.07.51l-3.66 3.66 1.42 1.42 3.66-3.66q.251.066.51.07a2 2 0 1 0 0-4M7.05 5.64a1 1 0 0 0-1.41 0 9 9 0 1 0 12.72 12.72 1 1 0 0 0 .3-.7 1 1 0 0 0-.3-.71z"
          />
    </Svg>
  );
}
