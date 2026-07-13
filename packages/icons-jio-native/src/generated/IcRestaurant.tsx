import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRestaurant(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 3a1.06 1.06 0 0 0-1 1.11V11H9V4a1 1 0 1 0-2 0v7H6V4.11A1.06 1.06 0 0 0 5 3a1.06 1.06 0 0 0-1 1.11V12a1 1 0 0 0 1 1h2v7a1 1 0 1 0 2 0v-7h2a1 1 0 0 0 1-1V4.11A1.06 1.06 0 0 0 11 3m4 0a1 1 0 0 0-1 1v16a1 1 0 0 0 2 0v-4h3a1 1 0 0 0 1-1V8a5 5 0 0 0-5-5"
          />
    </Svg>
  );
}
