import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.71 3.29a1 1 0 0 0-1.42 0l-16 16a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0L9 16.42c3.44 3.07 6.44 3.15 7.76 3a1.9 1.9 0 0 0 1.13-.57l1-1a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.82 0l-.71.71a1 1 0 0 1-1.095.219 1 1 0 0 1-.325-.22l-1.43-1.41 8.91-8.9a1 1 0 0 0 0-1.42M9 10.79a1 1 0 0 1 0-1.42l.71-.71a2 2 0 0 0 0-2.82L9 5.13a2 2 0 0 0-2.83 0l-1 1a1.9 1.9 0 0 0-.57 1.13 9.12 9.12 0 0 0 1.75 6.16z"
          />
    </Svg>
  );
}
