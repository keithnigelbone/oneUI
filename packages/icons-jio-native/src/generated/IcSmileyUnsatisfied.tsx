import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmileyUnsatisfied(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M7 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m9.24 7.21a1 1 0 0 1-1.41 0 4.1 4.1 0 0 0-5.66 0 1 1 0 1 1-1.41-1.42 6 6 0 0 1 8.48 0 1 1 0 0 1 0 1.42M15.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
